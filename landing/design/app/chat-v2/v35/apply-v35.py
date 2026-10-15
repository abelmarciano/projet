#!/usr/bin/env python3
"""Chat v35 : petits défauts de design dans le fil.
1. « _Conversation déplacée vers Jwel_ » s'affichait avec les tirets bas, dans une bulle avec avatar.
   -> pastille centrée et discrète, sans tirets bas (anciennes notes comprises).
2. Pendant que Claude réfléchit, il pouvait y avoir deux animations et deux lignes (logo animé de l'avatar
   + bulle vide, ou + second logo animé sur « J'analyse ta page… »).
   -> une bulle en cours sans texte affiche une seule ligne « Je réfléchis… » ; la ligne d'étape longue garde
      son texte avec un simple point animé au lieu d'un second logo.
Nouveau fichier : src/styles/gx-chat-fixes.css (jetons gx). Modifie : create.tsx, styles.css (un import).
À appliquer après apply-v34. Chaque bloc doit être trouvé exactement N fois, sinon rien n'est écrit.
Usage : python3 apply-v35.py [--check]"""
import sys, pathlib

C = 'src/routes/_authenticated/create.tsx'
S = 'src/styles.css'

EDITS = [
  (C, 1,
   'parts: [{ type: "text", text: `_${note}_` }]',
   'parts: [{ type: "text", text: `_${note}_<!--brand-note-->` }]'),
  (C, 1,
   '  return (\n    <div className={`gx-m ${isUser ? "gx-you" : "gx-ai"} group/msg`}>',
   '  // Note système (ex. « Conversation déplacée vers Jwel ») : pastille centrée, jamais une bulle avec des tirets bas.\n  if (!isUser && (text.includes("<!--brand-note-->") || String(message.id).startsWith("brand-note-"))) {\n    const note = stripTechnicalMarkers(text).replace(/^[_*\\s]+|[_*\\s]+$/g, "");\n    return <div className="gx-m-note" role="status"><span>{note}</span></div>;\n  }\n\n  return (\n    <div className={`gx-m ${isUser ? "gx-you" : "gx-ai"} group/msg`}>'),
  (C, 1,
   '          {smoothText && (\n',
   '          {!isUser && isStreaming && !smoothText && !(message.parts ?? []).some((p) => /^tool-(fetch_url|analyze_video|analyze_audio|validate_strategy|ask_blocking_question|answer_pending_question)$/.test(p.type ?? "") && (p as { output?: unknown; state?: string }).output === undefined && (p as { state?: string }).state !== "output-error") && (\n            <p className="gx-think-txt">Je réfléchis…</p>\n          )}\n          {smoothText && (\n'),
  (C, 1,
   '          <ThinkingLogo size={18} />\n          {PENDING_LABELS[p.type ?? ""]}',
   '          <span className="gx-tool-dot" aria-hidden />\n          {PENDING_LABELS[p.type ?? ""]}'),
  (S, 1,
   '@import "./styles/gx-composer-v2.css";\n',
   '@import "./styles/gx-composer-v2.css";\n@import "./styles/gx-chat-fixes.css";\n'),
]

NEWFILES = {
  'src/styles/gx-chat-fixes.css': '/* Petits défauts du fil du Chat : notes système (changement de marque) et attente unique. */\n.gx-m-note{display:flex;justify-content:center;margin:2px 0}\n.gx-m-note span{display:inline-flex;align-items:center;gap:6px;max-width:100%;padding:6px 14px;border-radius:999px;background:var(--gx-sunk);color:var(--gx-muted);font:500 12.5px/1.4 var(--gx-ui);text-align:center}\n.gx-m-note b{color:var(--gx-fg);font-weight:600}\n.gx-tool-dot{display:inline-block;flex:none;width:7px;height:7px;margin-right:2px;border-radius:50%;background:var(--gx-accent);animation:gx-tool-dot 1.2s ease-in-out infinite}\n@keyframes gx-tool-dot{50%{opacity:.25;transform:scale(.8)}}\n@media (prefers-reduced-motion:reduce){.gx-tool-dot{animation:none}}\n',
}


def main():
    check = "--check" in sys.argv
    files = {}
    for path, n, old, new in EDITS:
        p = pathlib.Path(path)
        if path not in files:
            if not p.exists():
                sys.exit(f"ARRÊT : {path} introuvable")
            files[path] = p.read_text(encoding="utf-8")
        c = files[path].count(old)
        if c != n:
            sys.exit(f"ARRÊT : {path} : bloc trouvé {c} fois au lieu de {n} :\n{old[:200]}")
        files[path] = files[path].replace(old, new)
    for path, txt in NEWFILES.items():
        p = pathlib.Path(path)
        if p.exists() and p.read_text(encoding="utf-8") != txt:
            sys.exit(f"ARRÊT : {path} existe déjà avec un autre contenu")
    if check:
        print("OK (--check) : tous les blocs trouvés, rien écrit.")
        return
    for path, txt in files.items():
        pathlib.Path(path).write_text(txt, encoding="utf-8")
        print("écrit :", path)
    for path, txt in NEWFILES.items():
        p = pathlib.Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(txt, encoding="utf-8")
        print("créé :", path)


if __name__ == "__main__":
    main()
