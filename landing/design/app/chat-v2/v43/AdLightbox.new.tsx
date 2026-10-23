function AdLightbox({
  ads,
  index,
  onClose,
  onNavigate,
  selected,
  onToggle,
}: {
  ads: Ad[];
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const ad = ads[index];
  const platforms = (ad.platforms ?? []).map((platform) => platformLabels[platform.toLowerCase()] ?? platform);
  const [mediaFailed, setMediaFailed] = useState(false);
  const mediaUrl = mediaFailed ? undefined : (ad.mediaUrl ?? undefined);
  useEffect(() => setMediaFailed(false), [ad.mediaUrl]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onNavigate(index - 1);
      if (event.key === "ArrowRight") onNavigate(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onNavigate]);

  const signalCls = ad.signal === "fort" ? "cl-sig cl-sig-ok" : ad.signal === "prometteur" ? "cl-sig cl-sig-ac" : "cl-sig";

  // Fenêtre au design de l'application : en-tête, création à gauche (flèches dessus), analyse à droite.
  return (
    <DialogPrimitive.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="cl-overlay" />
        <DialogPrimitive.Content className="cl-dlg console-app-portal" aria-describedby={undefined}>
          <header className="cl-h">
            <DialogPrimitive.Title asChild>
              <div className="cl-who"><PageIdentity ad={ad} large /></div>
            </DialogPrimitive.Title>
            <span className={signalCls}><i aria-hidden />{(ad.signal ?? "à surveiller").replace(/^./, (c) => c.toUpperCase())}</span>
            <span className="cl-sp" />
            <span className="cl-count">{index + 1} / {ads.length}</span>
            <DialogPrimitive.Close className="cl-ib" aria-label="Fermer"><X className="gx-i" /></DialogPrimitive.Close>
          </header>
          <div className="cl-body">
            <div className="cl-media">
              {mediaUrl && ad.mediaType === "video" ? (
                <video key={mediaUrl} src={mediaUrl} controls autoPlay playsInline onError={() => setMediaFailed(true)} />
              ) : mediaUrl ? (
                <img key={mediaUrl} src={mediaUrl} alt={`Publicité de ${ad.pageName ?? "cet annonceur"}`} onError={() => setMediaFailed(true)} />
              ) : (
                <div className="cl-na">
                  <b>Aperçu indisponible</b>
                  <p>La création n’a pas pu être récupérée depuis la bibliothèque officielle.</p>
                  {ad.libraryUrl ? (
                    <a className="cl-btn" href={ad.libraryUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="gx-i" /> Voir la création réelle</a>
                  ) : null}
                </div>
              )}
              {index > 0 ? (
                <button type="button" aria-label="Création précédente" className="cl-arr cl-prev" onClick={() => onNavigate(index - 1)}><ChevronLeft className="gx-i" /></button>
              ) : null}
              {index < ads.length - 1 ? (
                <button type="button" aria-label="Création suivante" className="cl-arr cl-next" onClick={() => onNavigate(index + 1)}><ChevronRight className="gx-i" /></button>
              ) : null}
            </div>
            <aside className="cl-side">
              <div className="cl-scroll">
                <div className="cl-facts">
                  <div><span><Clock className="gx-i" aria-hidden />Diffusion</span><b>{`${ad.runningDays ?? 0} jours${ad.stillActive ? " · active" : ""}`}</b></div>
                  <div><span><CalendarDays className="gx-i" aria-hidden />Période</span><b>{`${formatDate(ad.startedAt)} → ${formatDate(ad.endedAt)}`}</b></div>
                  <div><span><Users2 className="gx-i" aria-hidden />Portée UE</span><b>{typeof ad.euReach === "number" ? ad.euReach.toLocaleString("fr-FR") : "Non publiée"}</b></div>
                  <div><span><Layers3 className="gx-i" aria-hidden />Plateformes</span><b>{platforms.length ? platforms.join(", ") : "Non précisées"}</b></div>
                </div>
                {ad.body ? <div className="cl-det"><h4>Texte de l’accroche</h4><p>{ad.body}</p></div> : null}
                {ad.title ? <div className="cl-det"><h4>Titre</h4><p>{ad.title}</p></div> : null}
                {ad.description ? <div className="cl-det"><h4>Description</h4><p>{ad.description}</p></div> : null}
                {ad.destination ? <div className="cl-det"><h4>Destination affichée</h4><p>{ad.destination}</p></div> : null}
                {(ad.signalReasons ?? []).length ? (
                  <div className="cl-det">
                    <h4>Pourquoi ce signal</h4>
                    <ul>
                      {(ad.signalReasons ?? []).map((reason) => (
                        <li key={reason}><TrendingUp className="gx-i" aria-hidden />{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
              {onToggle || ad.libraryUrl ? (
                <div className="cl-act">
                  {onToggle ? (
                    <button type="button" className={`cl-btn${selected ? " cl-on" : " cl-pri"}`} aria-pressed={selected} onClick={onToggle}>
                      {selected ? <Check className="gx-i" /> : <Plus className="gx-i" />}
                      {selected ? "Référence ajoutée" : "Ajouter en référence"}
                    </button>
                  ) : null}
                  {ad.libraryUrl ? (
                    <a className="cl-btn" href={ad.libraryUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="gx-i" /> Voir dans la bibliothèque officielle</a>
                  ) : null}
                </div>
              ) : null}
            </aside>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

