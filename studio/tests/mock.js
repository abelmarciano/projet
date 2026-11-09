(() => {
  const seed = window.__SEED;
  const cols = {media: new Map(Object.entries(seed.media)), posts: new Map(Object.entries(seed.posts)), config: new Map(Object.entries(seed.config || {}))};
  const subs = {media: [], posts: [], config: []};
  const snap = (c) => ({docs: [...cols[c]].map(([id, d]) => ({id, exists: true, data: () => JSON.parse(JSON.stringify(d))})), size: cols[c].size, empty: !cols[c].size});
  const notify = (c) => setTimeout(() => subs[c].forEach((f) => f(snap(c))), 5);
  window.__log = [];
  const coll = (c) => ({
    onSnapshot(fn) { subs[c].push(fn); setTimeout(() => fn(snap(c)), 30); return () => {}; },
    doc(id) { return {
      async set(d) { window.__log.push(['set', c, id]); if (JSON.stringify(d).includes('undefined')) throw {code: 'invalid_argument'}; cols[c].set(id, JSON.parse(JSON.stringify(d))); notify(c); },
      async update(d) { window.__log.push(['update', c, id]); cols[c].set(id, {...cols[c].get(id), ...d}); notify(c); },
      async delete() { window.__log.push(['delete', c, id]); cols[c].delete(id); notify(c); },
      async get() { return {id, exists: cols[c].has(id), data: () => cols[c].get(id)}; } }; },
  });
  let n = 0;
  window.claude = {use: async (name) => ({
    db: {collection: coll, doc: () => null},
    assets: {async upload(b) { n++; window.__log.push(['upload', b.name]); return {id: 'up' + n, url: '/_blob/up' + n, sizeBytes: b.size, contentType: b.type}; }, async list() { return {assets: [], usage: {files: 50, bytes: 61e6, maxFiles: 5000, maxBytes: 5 * 1073741824}}; }, async delete() { return {deleted: true}; }},
    user: {async id() { return 'u_test'; }},
  })[name] ?? null};
})();
