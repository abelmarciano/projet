#!/usr/bin/env python3
# P4 : nettoyage sûr de src/styles/gx-console.css (suppression de déclarations mortes et de règles vides).
# Usage : python3 scripts/apply.py [chemin/vers/src/styles/gx-console.css]
# Chaque bloc d'origine doit être trouvé exactement une fois, en début de ligne ; sinon arrêt sans rien écrire.
import hashlib, sys
PATH = sys.argv[1] if len(sys.argv) > 1 else "src/styles/gx-console.css"
ORIG_SHA = "da0ac161afbf516e0291f821279ac4e420960b8e1b97ca962d53ab5494c02110"
RESULT_SHA = "49e9b051c9b2720da69b251ff592bec439f38e0a2f4895dd294662a2c65d22dd"
BLOCKS = [
 [
  ".gx-num{font-family:var(--gx-mono);font-variant-numeric:tabular-nums;letter-spacing:-.01em}\n.gx-wrap{width:100%;max-width:980px;margin:0 auto;padding:28px 24px 48px;display:flex;flex-direction:column;gap:28px}\n",
  ".gx-wrap{width:100%;max-width:980px;margin:0 auto;padding:28px 24px 48px;display:flex;flex-direction:column;gap:28px}\n"
 ],
 [
  ".gx-sh h2{margin:0;font-size:13px;font-weight:600;letter-spacing:.01em}\n",
  ".gx-sh h2{margin:0;font-weight:600;letter-spacing:.01em}\n"
 ],
 [
  ".gx-act:hover{border-color:var(--gx-fg)}\n.gx-act.gx-pri{background:var(--gx-fg);color:var(--gx-bg);border-color:var(--gx-fg)}\n",
  ""
 ],
 [
  ".gx-vers button[aria-pressed=\"true\"]{background:var(--gx-fg);color:var(--gx-bg);border-color:var(--gx-fg)}\n",
  ""
 ],
 [
  ".gx-st.gx-new{color:var(--gx-meta);background:color-mix(in srgb,var(--gx-meta) 12%,transparent)}\n",
  ".gx-st.gx-new{background:color-mix(in srgb,var(--gx-meta) 12%,transparent)}\n"
 ],
 [
  ".gx-toast{position:fixed;right:20px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:60;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:12px;background:var(--gx-fg);color:var(--gx-bg);font-size:13px;font-weight:500;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);transform:translateY(16px);opacity:0;transition:all .3s;pointer-events:none}\n.gx-toast.gx-on{transform:none;opacity:1}\n",
  ".gx-toast{position:fixed;z-index:60;display:flex;align-items:center;gap:8px;padding:11px 14px;border-radius:12px;background:var(--gx-fg);color:var(--gx-bg);font-size:13px;font-weight:500;box-shadow:0 20px 40px -16px rgba(0,0,0,.5);opacity:0;transition:all .3s;pointer-events:none}\n.gx-toast.gx-on{opacity:1}\n"
 ],
 [
  ".gx-logo{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:var(--gx-fg);color:var(--gx-bg)}\n",
  ".gx-logo{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;color:var(--gx-bg)}\n"
 ],
 [
  ".gx-nv em{font-style:normal;font-size:11px;font-weight:600;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:grid;place-items:center;background:var(--gx-accent);color:#fff}\n",
  ".gx-nv em{font-style:normal;font-size:11px;font-weight:600;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:grid;place-items:center;color:#fff}\n"
 ],
 [
  ".gx-btn.gx-pri{background:var(--gx-fg);color:var(--gx-bg);border-color:var(--gx-fg)}\n.gx-btn.gx-pri:hover{background:color-mix(in srgb,var(--gx-fg) 86%,var(--gx-accent))}\n",
  ""
 ],
 [
  ".gx-av.gx-ai{background:var(--gx-fg);color:var(--gx-bg);font-family:var(--gx-display)}\n",
  ".gx-av.gx-ai{font-family:var(--gx-display)}\n"
 ],
 [
  ".gx-chatv{display:grid;grid-template-columns:250px minmax(0,1fr);height:calc(100vh - 57px - 52px);min-height:560px;border:1px solid var(--gx-line);border-radius:18px;background:var(--gx-surface);overflow:hidden}\n",
  ".gx-chatv{display:grid;height:calc(100vh - 57px - 52px);min-height:560px;border:1px solid var(--gx-line);border-radius:18px;background:var(--gx-surface);overflow:hidden}\n"
 ],
 [
  ".gx-convs{display:flex;flex-direction:column;gap:2px;padding:12px;border-right:1px solid var(--gx-line);background:var(--gx-raised);overflow:auto}\n",
  ".gx-convs{display:flex;flex-direction:column;gap:2px;border-right:1px solid var(--gx-line);background:var(--gx-raised);overflow:auto}\n"
 ],
 [
  ".gx-convs .gx-srch{min-width:0;height:44px;padding:0 14px;font-size:14px;margin-bottom:8px}\n.gx-convs .gx-srch .gx-i{width:16px;height:16px}\n",
  ""
 ],
 [
  ".gx-m.gx-you p{background:var(--gx-fg);color:var(--gx-bg);padding:10px 14px;border-radius:16px 16px 4px 16px}\n",
  ".gx-m.gx-you p{padding:10px 14px;border-radius:16px 16px 4px 16px}\n"
 ],
 [
  ".gx-stepper span.gx-on{background:var(--gx-accent);color:#fff}\n",
  ".gx-stepper span.gx-on{color:#fff}\n"
 ],
 [
  ".gx-pv{position:relative;height:440px;max-height:62vh;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#000;box-shadow:0 20px 50px -24px rgba(0,0,0,.5)}\n",
  ".gx-pv{position:relative;height:440px;aspect-ratio:9/16;border-radius:14px;overflow:hidden;background:#000;box-shadow:0 20px 50px -24px rgba(0,0,0,.5)}\n"
 ],
 [
  ".gx-lg.gx-meta{background:var(--gx-meta);font-family:Georgia,serif;font-size:22px}\n.gx-lg.gx-shop{background:#5E8E3E}\n",
  ".gx-lg.gx-meta{font-size:22px}\n"
 ],
 [
  ".gx-note{display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:10px;background:var(--gx-warn-soft);color:var(--gx-warn);font-size:13px;font-weight:500}\n",
  ".gx-note{display:flex;gap:8px;align-items:center;padding:10px 12px;border-radius:10px;background:var(--gx-warn-soft);font-size:13px;font-weight:500}\n"
 ],
 [
  ".gx-wsteps .gx-on i{background:var(--gx-fg);color:var(--gx-bg)}\n",
  ""
 ],
 [
  "#ctab td:nth-child(2) small{white-space:normal}\n",
  ""
 ],
 [
  "  .gx-chatv{height:calc(100vh - 57px - 36px - 64px)}\n",
  ""
 ],
 [
  "  .gx-chatv{grid-template-columns:minmax(0,1fr);height:calc(100vh - 57px - 36px)}\n",
  "  .gx-chatv{height:calc(100vh - 57px - 36px)}\n"
 ],
 [
  ".gx-wsbtn .gx-bm{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;overflow:hidden;font-size:11px;font-weight:700;color:#fff;background:var(--gx-pri);flex:none}\n",
  ".gx-wsbtn .gx-bm{width:26px;height:26px;border-radius:7px;display:grid;place-items:center;overflow:hidden;font-size:11px;font-weight:700;flex:none}\n"
 ],
 [
  ".gx-lg.gx-meta{background:#0866FF;font-family:inherit}\n",
  ".gx-lg.gx-meta{background:#0866FF}\n"
 ],
 [
  ".gx-editor-header .gx-ed-sub{display:flex;align-items:center;gap:6px;flex:1;min-width:0;flex-wrap:nowrap}\n.gx-editor-header .gx-ed-name{width:100%;min-width:70px;max-width:480px;font-weight:600;font-size:13px;color:var(--gx-fg);margin:0;padding:4px;letter-spacing:0}\n",
  ".gx-editor-header .gx-ed-sub{display:flex;align-items:center;gap:6px;min-width:0;flex-wrap:nowrap}\n.gx-editor-header .gx-ed-name{max-width:480px;font-weight:600;font-size:13px;color:var(--gx-fg);margin:0;padding:4px;letter-spacing:0}\n"
 ]
]

def count_at_line_start(text, block):
    n, i = 0, text.find(block)
    while i != -1:
        if i == 0 or text[i - 1] == "\n":
            n += 1
        i = text.find(block, i + 1)
    return n

text = open(PATH, encoding="utf-8").read()
sha = hashlib.sha256(text.encode("utf-8")).hexdigest()
if sha == RESULT_SHA:
    print("Déjà appliqué (sha256 du résultat attendu)."); sys.exit(0)
if sha != ORIG_SHA:
    print("ATTENTION : gx-console.css n'est pas la version d'origine attendue (sha256 %s, attendu %s)." % (sha[:16], ORIG_SHA[:16]))
    print("On continue seulement si chaque bloc est trouvé exactement une fois.")
for k, (old, new) in enumerate(BLOCKS, 1):
    c = count_at_line_start(text, old)
    if c != 1:
        print("ARRÊT : bloc %d trouvé %d fois, rien n'a été écrit.\n%s" % (k, c, old[:300])); sys.exit(1)
    i = text.find(old)
    while i > 0 and text[i - 1] != "\n":
        i = text.find(old, i + 1)
    text = text[:i] + new + text[i + len(old):]
open(PATH, "w", encoding="utf-8").write(text)
res = hashlib.sha256(text.encode("utf-8")).hexdigest()
print("OK : %d blocs appliqués ; %d lignes ; sha256 %s%s" % (len(BLOCKS), text.count("\n"), res[:16], "" if res == RESULT_SHA else " (différent du résultat de référence car le fichier de départ différait)"))
