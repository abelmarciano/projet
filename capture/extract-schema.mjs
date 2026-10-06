import fs from 'fs';
const src = fs.readFileSync(process.argv[2], 'utf8').split('\n');
const out = {}; let table = null, mode = null, rel = null;
for (let i = 0; i < src.length; i++) {
  const l = src[i];
  if (/^    Views: \{/.test(l)) break;
  let m = l.match(/^      ([a-z_]+): \{$/);
  if (m) { table = m[1]; out[table] = { cols: {}, rels: [] }; continue; }
  if (!table) continue;
  if (/^        Row: \{/.test(l)) { mode = 'row'; continue; }
  if (/^        (Insert|Update): \{/.test(l)) { mode = null; continue; }
  if (/^        Relationships: \[/.test(l)) { mode = 'rel'; continue; }
  if (mode === 'row') {
    if (/^        \}/.test(l)) { mode = null; continue; }
    m = l.match(/^          ([a-z_0-9]+): (.*)$/);
    if (m) {
      let t = m[2];
      if (t === '' || t.trim() === '') { t = src[i+1].trim(); }
      out[table].cols[m[1]] = t;
    }
  }
  if (mode === 'rel') {
    if (/^          \{/.test(l)) rel = {};
    m = l.match(/foreignKeyName: "(.*)"/); if (m) rel.name = m[1];
    m = l.match(/columns: \["(.*?)"\]/); if (m) rel.col = m[1];
    m = l.match(/referencedRelation: "(.*)"/); if (m) rel.ref = m[1];
    m = l.match(/referencedColumns: \["(.*?)"\]/); if (m) { rel.refCol = m[1]; out[table].rels.push(rel); }
    if (/^        \]/.test(l)) mode = null;
  }
}
fs.writeFileSync('schema.json', JSON.stringify(out, null, 1));
for (const [t, v] of Object.entries(out)) console.log(t, Object.keys(v.cols).length, v.rels.map(r => `${r.col}->${r.ref}`).join(', '));
