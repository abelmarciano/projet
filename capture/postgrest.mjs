// Mini-moteur PostgREST en mémoire, suffisant pour faire tourner l'UI Classicall en démo.
import fs from 'fs';
const schema = JSON.parse(fs.readFileSync(new URL('./schema.json', import.meta.url)));

// ---------- parsing du paramètre select ----------
function splitTop(s, sep = ',') {
  const out = []; let depth = 0, cur = '', q = false;
  for (const ch of s) {
    if (ch === '"') q = !q;
    if (!q && ch === '(') depth++;
    if (!q && ch === ')') depth--;
    if (!q && depth === 0 && ch === sep) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.length) out.push(cur);
  return out.map((x) => x.trim()).filter(Boolean);
}
export function parseSelect(s) {
  s = (s || '*').replace(/\s+/g, '');
  return splitTop(s).map((item) => {
    const p = item.indexOf('(');
    if (p === -1) {
      let [alias, col] = item.includes(':') ? item.split(':') : [null, item];
      col = col.split('::')[0];
      return { type: 'col', col, alias: alias || col };
    }
    let head = item.slice(0, p); const inner = item.slice(p + 1, -1);
    let alias = null;
    if (head.includes(':')) [alias, head] = head.split(':');
    let [rel, hint] = head.split('!');
    let inner_join = false;
    if (hint === 'inner') { inner_join = true; hint = undefined; }
    else if (hint && hint.endsWith('inner')) inner_join = true;
    return { type: 'embed', rel, hint, alias: alias || rel, inner_join, sel: parseSelect(inner) };
  });
}

// ---------- résolution des relations ----------
function resolveRel(table, rel, hint) {
  const t = schema[table];
  const cols = t ? Object.keys(t.cols) : [];
  const fkFromHint = (h) => {
    if (!h) return null;
    if (cols.includes(h)) return h;
    let c = h.replace(/^fk_/, '').replace(/_fkey$/, '').replace(new RegExp(`^${table}_`), '');
    const relCols = t.rels.map((x) => x.col);
    if (relCols.includes(c)) return c;
    if (relCols.includes(c + '_id')) return c + '_id';
    if (cols.includes(c + '_id')) return c + '_id';
    if (cols.includes(c)) return c;
    return null;
  };
  // rel peut être un nom de colonne FK (ex. campaigns:campaign_id(...))
  if (cols.includes(rel)) {
    const r = t.rels.find((x) => x.col === rel);
    if (r) return { kind: 'one', table: r.ref, local: rel, remote: r.refCol };
  }
  const target = schema[rel] ? rel : null;
  if (target) {
    const hc = fkFromHint(hint);
    let r = hc ? t.rels.find((x) => x.col === hc) : t.rels.find((x) => x.ref === target);
    if (!r && hc) {
      // FK connue côté app mais absente des types : on devine la cible
      return { kind: 'one', table: target, local: hc, remote: 'id' };
    }
    if (r) return { kind: 'one', table: target, local: r.col, remote: r.refCol };
    // relation inverse (one-to-many)
    const rr = schema[target].rels.find((x) => x.ref === table);
    if (rr) return { kind: 'many', table: target, local: rr.refCol, remote: rr.col };
    // tentative par convention
    if (cols.includes(target.replace(/s$/, '') + '_id')) return { kind: 'one', table: target, local: target.replace(/s$/, '') + '_id', remote: 'id' };
  }
  return null;
}

function project(db, table, row, sel, embedFilters, path = '') {
  const out = {};
  for (const it of sel) {
    if (it.type === 'col') {
      if (it.col === '*') Object.assign(out, row);
      else out[it.alias] = row[it.col] ?? null;
    } else {
      const r = resolveRel(table, it.rel, it.hint);
      if (!r) { out[it.alias] = null; continue; }
      const sub = path ? `${path}.${it.alias}` : it.alias;
      const f = embedFilters[sub] || [];
      const rows = (db[r.table] || []).filter((x) => x[r.remote] === row[r.local] && row[r.local] != null)
        .filter((x) => f.every((fn) => fn(x)));
      const proj = rows.map((x) => project(db, r.table, x, it.sel, embedFilters, sub));
      out[it.alias] = r.kind === 'one' ? (proj[0] ?? null) : proj;
      if (it.inner_join && (r.kind === 'one' ? !proj.length : !proj.length)) out.__drop = true;
      if (f.length && !proj.length) out.__embedFail = (out.__embedFail || []).concat(it.alias);
    }
  }
  return out;
}

// ---------- filtres ----------
const norm = (v) => (v === undefined ? null : v);
function cmpVal(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1; if (b == null) return 1;
  if (typeof a === 'number' || typeof b === 'number') return Number(a) - Number(b);
  if (typeof a === 'boolean') return (a ? 1 : 0) - (b === 'true' || b === true ? 1 : 0);
  return String(a) < String(b) ? -1 : String(a) > String(b) ? 1 : 0;
}
function parseList(s) {
  s = s.replace(/^\(/, '').replace(/\)$/, '');
  return splitTop(s).map((x) => x.replace(/^"|"$/g, ''));
}
function likeRe(p, ci) {
  const esc = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/[%*]/g, '.*').replace(/_/g, '.');
  return new RegExp(`^${esc}$`, ci ? 'is' : 's');
}
function opFn(col, opstr) {
  let neg = false;
  if (opstr.startsWith('not.')) { neg = true; opstr = opstr.slice(4); }
  const dot = opstr.indexOf('.');
  const op = opstr.slice(0, dot), val = decodeURIComponentSafe(opstr.slice(dot + 1));
  const get = (r) => norm(r[col]);
  let f;
  switch (op) {
    case 'eq': f = (r) => get(r) != null && cmpVal(get(r), val) === 0; break;
    case 'neq': f = (r) => get(r) != null && cmpVal(get(r), val) !== 0; break;
    case 'gt': f = (r) => get(r) != null && cmpVal(get(r), val) > 0; break;
    case 'gte': f = (r) => get(r) != null && cmpVal(get(r), val) >= 0; break;
    case 'lt': f = (r) => get(r) != null && cmpVal(get(r), val) < 0; break;
    case 'lte': f = (r) => get(r) != null && cmpVal(get(r), val) <= 0; break;
    case 'like': f = (r) => get(r) != null && likeRe(val).test(String(get(r))); break;
    case 'ilike': f = (r) => get(r) != null && likeRe(val, true).test(String(get(r))); break;
    case 'is': f = (r) => (val === 'null' ? get(r) == null : val === 'true' ? get(r) === true : val === 'false' ? get(r) === false : true); break;
    case 'in': { const l = parseList(val); f = (r) => get(r) != null && l.some((x) => cmpVal(get(r), x) === 0); break; }
    case 'cs': { const l = val.startsWith('{') ? val.slice(1, -1).split(',').map((x) => x.replace(/^"|"$/g, '')) : JSON.parse(val);
      f = (r) => Array.isArray(get(r)) && [].concat(l).every((x) => get(r).includes(x)); break; }
    case 'ov': { const l = val.slice(1, -1).split(','); f = (r) => Array.isArray(get(r)) && l.some((x) => get(r).includes(x)); break; }
    case 'fts': case 'plfts': case 'wfts': f = () => true; break;
    default: f = () => true;
  }
  return neg ? (r) => !f(r) : f;
}
function decodeURIComponentSafe(s) { try { return decodeURIComponent(s); } catch { return s; } }

function logicFn(expr, conj) {
  // expr: "(a.eq.1,and(b.is.null,c.eq.2))"
  const parts = parseList(expr);
  const fns = parts.map((p) => {
    let m = p.match(/^(not\.)?(and|or)\((.*)\)$/s);
    if (m) { const inner = logicFn(`(${m[3]})`, m[2]); return m[1] ? (r) => !inner(r) : inner; }
    const i = p.indexOf('.');
    const col = p.slice(0, i), rest = p.slice(i + 1);
    if (col.includes('->')) return () => true;
    return opFn(col, rest);
  });
  return conj === 'or' ? (r) => fns.some((f) => f(r)) : (r) => fns.every((f) => f(r));
}

// ---------- requête ----------
const selAliases_has = (u, k) => parseSelect(u.searchParams.get('select')).some((x) => x.type === 'embed' && x.alias === k);
const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'on_conflict', 'columns']);
export function handleRest(db, method, url, headers, bodyText) {
  const u = new URL(url);
  const table = u.pathname.split('/rest/v1/')[1];
  const prefer = headers['prefer'] || '';
  const accept = headers['accept'] || '';
  const single = accept.includes('vnd.pgrst.object');

  if (table.startsWith('rpc/')) return rpc(db, table.slice(4), bodyText);
  if (!db[table]) db[table] = [];
  const rowsAll = db[table];

  const filters = [], embedFilters = {};
  let orders = [], limit = null, offset = 0;
  for (const [k, v] of u.searchParams) {
    if (k === 'order') { orders = v.split(',').map((o) => { const [c, d, n] = o.split('.'); return { c, desc: d === 'desc', nullsFirst: n === 'nullsfirst' }; }); continue; }
    if (k === 'limit') { limit = +v; continue; }
    if (k === 'offset') { offset = +v; continue; }
    if (RESERVED.has(k) || k.endsWith('.order') || k.endsWith('.limit')) continue;
    if (k === 'or' || k === 'and') { filters.push(logicFn(v, k)); continue; }
    if (k === 'not.or' || k === 'not.and') { const f = logicFn(v, k.slice(4)); filters.push((r) => !f(r)); continue; }
    if (selAliases_has(u, k)) continue;
    if (k.includes('.')) {
      // filtre sur ressource imbriquée : lead.department=eq.69
      const i = k.lastIndexOf('.'); const p = k.slice(0, i), c = k.slice(i + 1);
      if (/^(or|and)$/.test(c)) (embedFilters[p] ||= []).push(logicFn(v, c));
      else (embedFilters[p] ||= []).push(opFn(c, v));
      continue;
    }
    filters.push(opFn(k, v));
  }

  const selAliases = new Set(parseSelect(u.searchParams.get('select')).filter((x) => x.type === 'embed').map((x) => x.alias));
  const postFilters = [];
  for (const [k, v] of u.searchParams) if (selAliases.has(k)) postFilters.push(opFn(k, v));
  let matched = rowsAll.filter((r) => filters.every((f) => f(r)));

  if (method === 'GET' || method === 'HEAD') {
    const sel = parseSelect(u.searchParams.get('select'));
    if (orders.length) matched = [...matched].sort((a, b) => {
      for (const o of orders) {
        const va = a[o.c], vb = b[o.c];
        if (va == null && vb == null) continue;
        if (va == null || vb == null) return (va == null ? 1 : -1) * (o.nullsFirst ? -1 : 1);
        const c = cmpVal(va, vb); if (c) return o.desc ? -c : c;
      }
      return 0;
    });
    const innerAliases = new Set(sel.filter((s) => s.type === 'embed' && s.inner_join).map((s) => s.alias));
    let rows = matched.map((r) => project(db, table, r, sel, embedFilters))
      .filter((r) => !r.__drop && !(r.__embedFail || []).some((a) => innerAliases.has(a)));
    rows.forEach((r) => { delete r.__drop; delete r.__embedFail; });
    rows = rows.filter((r) => postFilters.every((f) => f(r)));
    // embarqués filtrés : une ligne sans correspondance garde un embed null (PostgREST)
    const total = rows.length;
    const range = headers['range'];
    if (range) { const [a, b] = range.split('-').map(Number); offset = a; limit = b - a + 1; }
    const page = rows.slice(offset, limit != null ? offset + limit : undefined);
    const h = { 'content-range': `${page.length ? offset : '*'}-${page.length ? offset + page.length - 1 : ''}/${prefer.includes('count=') ? total : '*'}`.replace('*-/', '*/') };
    if (single) {
      if (page.length !== 1) return { status: 406, body: { code: 'PGRST116', details: `The result contains ${page.length} rows`, hint: null, message: 'JSON object requested, multiple (or no) rows returned' }, headers: h };
      return { status: 200, body: method === 'HEAD' ? null : page[0], headers: h };
    }
    return { status: 200, body: method === 'HEAD' ? null : page, headers: h };
  }

  const ret = prefer.includes('return=representation');
  const sel = parseSelect(u.searchParams.get('select'));
  if (method === 'POST') {
    let body = JSON.parse(bodyText || '[]'); if (!Array.isArray(body)) body = [body];
    const ins = body.map((b) => ({ id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...b }));
    rowsAll.push(...ins);
    const out = ins.map((r) => project(db, table, r, sel, {}));
    return { status: 201, body: ret ? (single ? out[0] : out) : null };
  }
  if (method === 'PATCH') {
    const patch = JSON.parse(bodyText || '{}');
    matched.forEach((r) => Object.assign(r, patch));
    const out = matched.map((r) => project(db, table, r, sel, {}));
    return { status: ret ? 200 : 204, body: ret ? (single ? out[0] ?? null : out) : null };
  }
  if (method === 'DELETE') {
    for (const r of matched) rowsAll.splice(rowsAll.indexOf(r), 1);
    return { status: ret ? 200 : 204, body: ret ? matched : null };
  }
  return { status: 405, body: { message: 'method' } };
}

function rpc(db, fn, bodyText) {
  const args = JSON.parse(bodyText || '{}');
  switch (fn) {
    case 'get_user_role_in_company': return { status: 200, body: 'admin' };
    case 'is_user_in_company': case 'can_user_see_appointment': return { status: 200, body: true };
    case 'get_company_user_ids': return { status: 200, body: db.user_companies.map((u) => u.user_id) };
    case 'get_next_ticket_number': return { status: 200, body: 'T-001' };
    case 'check_brute_force_attempts': return { status: 200, body: false };
    case 'search_leads_fast': {
      const q = String(args.p_search || args.search_term || args.search || '').toLowerCase();
      const rows = db.leads.filter((l) => `${l.first_name} ${l.last_name} ${l.phone_1} ${l.email}`.toLowerCase().includes(q));
      return { status: 200, body: rows.map((r) => ({ id: r.id, total_count: rows.length })) };
    }
    case 'leads_by_telepro_assignment_date': {
      return { status: 200, body: db.leads.map((l) => ({ lead_id: l.id, id: l.id, assigned_at: l.created_at })) };
    }
    default: return { status: 200, body: [] };
  }
}
