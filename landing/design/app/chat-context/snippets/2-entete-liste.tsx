{/* REMPLACE, dans create.tsx, tout le bloc <div className="gx-cv-h"> … </div>
    en haut de <aside className="gx-convs">. Mêmes boutons, mêmes gestionnaires.
    « Conversations » sur une ligne, la marque du menu principal en petit dessous. */}
<div className="gx-cv-h">
  <div className="gx-cv-ht">
    <b>Conversations</b>
    <span className="gx-cv-hb">
      {brandView === "all" ? "Toutes les marques"
        : brandView === "white_label" ? <><EyeOff className="gx-i" aria-hidden />Marque blanche</>
        : screenBrandId && brandById.get(screenBrandId) ? <BrandMark brand={brandById.get(screenBrandId)!} size={14} />
        : "Aucune marque"}
    </span>
  </div>
  <div className="gx-cv-ha">
    <button
      type="button"
      className="gx-ib gx-sm"
      onClick={() => { setConvsOpen(false); void startConversation(); }}
      disabled={creatingNew}
      aria-label="Nouvelle conversation"
      title="Nouvelle conversation"
    >
      {creatingNew ? <Loader2 className="gx-i animate-spin" /> : <Plus className="gx-i" />}
    </button>
    <button
      type="button"
      className="gx-ib gx-sm gx-cv-x"
      onClick={() => setConvsOpen(false)}
      aria-label="Fermer la liste des conversations"
      title="Fermer"
    >
      <X className="gx-i" />
    </button>
    <button
      type="button"
      className="gx-ib gx-sm gx-cv-collapse"
      onClick={toggleConvsCollapsed}
      aria-label="Ranger la liste des conversations"
      title="Ranger la liste"
    >
      <PanelLeftClose className="gx-i" />
    </button>
  </div>
</div>
