// REMPLACE, dans create.tsx, la ligne
//   const [showOthersMap, setShowOthersMap] = useState<Record<string, boolean>>({});
// et toute la fonction renderGroupBody (jusqu'à son « }; » final, juste avant
// « const brandGroups = »). Changements :
// - « Favoris » n'apparaît que s'il y a au moins un favori ;
// - seuls les dossiers qui contiennent des conversations sont affichés ; les dossiers
//   vides restent accessibles derrière « N dossiers vides » (vue d'une seule marque) ;
// - sans favori ni dossier affiché, les conversations s'affichent directement,
//   sans dossier « Toutes ».
// Le bouton « Nouveau dossier », les menus ⋯ (renommer, supprimer) et
// « Déplacer vers » sont inchangés.
const [showOthersMap, setShowOthersMap] = useState<Record<string, boolean>>({});
const [showEmptyFolders, setShowEmptyFolders] = useState(false);
const renderGroupBody = (rows: ConvRow[], gk: string) => {
  const gFav = rows.filter((c) => c.is_favorite);
  const gByFolder = new Map<string, ConvRow[]>();
  const gUnfiled: ConvRow[] = [];
  for (const c of rows) {
    if (c.folder_id) { const arr = gByFolder.get(c.folder_id) ?? []; arr.push(c); gByFolder.set(c.folder_id, arr); }
    else if (!c.is_favorite) gUnfiled.push(c);
  }
  const fullFolders = folderList.filter((f) => gByFolder.has(f.id));
  const emptyFolders = gk === "one" ? folderList.filter((f) => !gByFolder.has(f.id)) : [];
  const gFolders = showEmptyFolders ? [...fullFolders, ...emptyFolders] : fullFolders;
  const flat = gFav.length === 0 && fullFolders.length === 0;
  return (
    <>
      {/* Favoris : seulement s'il y en a */}
      {gFav.length > 0 && (
        <>
          <button
            type="button"
            className="gx-cv-g"
            onClick={() => setShowFav((v) => !v)}
            aria-expanded={showFav}
            title={showFav ? "Masquer les favoris" : "Afficher les favoris"}
          >
            Favoris
          </button>
          {showFav && gFav.map(renderConvRow)}
        </>
      )}

      {/* Dossiers : titre + bouton « Nouveau dossier » (toujours en vue d'une seule marque) */}
      {(gk === "one" || fullFolders.length > 0) && (
        <div className="gx-cv-g gx-cv-gr">
          <span>Dossiers</span>
          <button type="button" className="gx-cv-add" onClick={handleCreateFolder} aria-label="Nouveau dossier" title="Nouveau dossier">
            <FolderPlus className="gx-i" />
          </button>
        </div>
      )}
      {gFolders.map((f) => {
        const list = gByFolder.get(f.id) ?? [];
        const open = openFolderIds[`${gk}:${f.id}`] ?? false;
        const toggle = () => setOpenFolderIds((s) => ({ ...s, [`${gk}:${f.id}`]: !open }));
        return (
          <div key={f.id} className="gx-cv-f">
            <div
              className={`gx-cv gx-cv-row${open ? " gx-open" : ""}`}
              role="button"
              tabIndex={0}
              aria-expanded={open}
              onClick={toggle}
              onKeyDown={(e) => toggleOnKey(e, toggle)}
            >
              {open ? <FolderOpen className="gx-i" /> : <Folder className="gx-i" />}
              <span>{f.name}</span>
              {list.length > 0 && <small>{list.length}</small>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="gx-cv-more"
                    aria-label="Options du dossier"
                  >
                    <MoreHorizontal className="gx-i" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => handleRenameFolder(f.id, f.name)}>
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Renommer
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteFolder(f.id)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {open && (
              <div className="gx-cv-in">
                {list.length === 0 ? <div className="gx-cv-e">Vide</div> : list.map(renderConvRow)}
              </div>
            )}
          </div>
        );
      })}
      {emptyFolders.length > 0 && (
        <button type="button" className="gx-cv-ev" onClick={() => setShowEmptyFolders((v) => !v)} aria-expanded={showEmptyFolders}>
          {showEmptyFolders
            ? "Masquer les dossiers vides"
            : `${emptyFolders.length} dossier${emptyFolders.length > 1 ? "s" : ""} vide${emptyFolders.length > 1 ? "s" : ""}`}
        </button>
      )}

      {/* Conversations hors dossier : directement si rien d'autre, sinon dans « Autres » */}
      {gUnfiled.length > 0 && (flat && !showEmptyFolders ? (
        gUnfiled.map(renderConvRow)
      ) : (
        <div className="gx-cv-f">
          <div
            className={`gx-cv gx-cv-row${(showOthersMap[gk] ?? true) ? " gx-open" : ""}`}
            role="button"
            tabIndex={0}
            aria-expanded={(showOthersMap[gk] ?? true)}
            onClick={() => setShowOthersMap((m) => ({ ...m, [gk]: !(m[gk] ?? true) }))}
            onKeyDown={(e) => toggleOnKey(e, () => setShowOthersMap((m) => ({ ...m, [gk]: !(m[gk] ?? true) })))}
          >
            {(showOthersMap[gk] ?? true) ? <FolderOpen className="gx-i" /> : <Folder className="gx-i" />}
            <span>Autres</span>
            <small>{gUnfiled.length}</small>
          </div>
          {(showOthersMap[gk] ?? true) && <div className="gx-cv-in">{gUnfiled.map(renderConvRow)}</div>}
        </div>
      ))}
    </>
  );
};
