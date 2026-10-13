{/* REMPLACE, dans create.tsx (zone de saisie, dans <div className="gx-cmp-w">),
    tout le bloc qui va de <ConversationBrandBar … /> jusqu'à la fermeture de
    <div className="gx-att-w"> … </div> (juste avant <input ref={fileInputRef} …>).
    Toute la logique est conservée : mêmes états, mêmes gestionnaires. */}
<div className="gx-ctx" aria-label="Contexte du prochain message">
  <ConversationBrandBar
    conversationId={conversationId}
    disabled={isLoading}
    onSwitched={(patch, note) => {
      setState((prev) => {
        const next: Record<string, unknown> = { ...prev, ...patch };
        if (patch.brandingMode === "white_label") delete next.creativeBrandId;
        stateRef.current = next;
        return next;
      });
      setMessages((prev) => [...prev, { id: `brand-note-${Date.now()}`, role: "assistant", parts: [{ type: "text", text: `_${note}_` }] } as UIMessage]);
    }}
  />
  {(pendingImages.length > 0 || pendingVideos.length > 0 || pendingAudios.length > 0 || competitorRefs.length > 0 || !!pendingCampaign || pendingActors.length > 0 || pendingCreatives.length > 0 || !!replyingTo) && (
    <span className="gx-ctx-sep" aria-hidden />
  )}

  {pendingActors.map((a) => (
    <AttachChip
      key={`pending-actor-${a.url}`}
      kind="Acteur"
      name={a.name ?? "Acteur"}
      thumb={{ src: a.url, video: /\.(mp4|webm|mov)(\?|$)/i.test(a.url), alt: a.name ?? "Acteur" }}
      onRemove={() => setPendingActors((prev) => prev.filter((x) => x.url !== a.url))}
      removeLabel="Retirer l'acteur"
    />
  ))}

  {pendingCreatives.map((c) => (
    <AttachChip
      key={`pending-creative-${c.id}`}
      kind={c.contentType === "video" ? "Vidéo" : "Création"}
      name={c.title}
      thumb={{ src: c.thumbUrl ?? c.url, video: /\.(mp4|webm|mov)(\?|$)/i.test(c.thumbUrl ?? c.url) || (c.contentType === "video" && !c.thumbUrl), alt: c.title }}
      onRemove={() => setPendingCreatives((prev) => prev.filter((x) => x.id !== c.id))}
      removeLabel="Retirer la création"
    />
  ))}

  {pendingImages.map((src, i) => (
    <AttachChip
      key={`pending-${i}-${src.slice(0, 20)}`}
      kind="Image"
      name={`Image ${i + 1}`}
      thumb={{ src, alt: `produit ${i + 1}` }}
      onRemove={() => {
        const idx = productImages.indexOf(src);
        if (idx >= 0) removeProductImage(idx);
        else setPendingImages((prev) => prev.filter((u) => u !== src));
      }}
      removeLabel="Retirer l'image"
    />
  ))}

  {pendingVideos.map((v) => (
    <AttachChip
      key={`pending-video-${v.url}`}
      kind="Vidéo"
      name={v.name}
      thumb={{ src: v.url, video: true, alt: v.name }}
      onRemove={() => setPendingVideos((prev) => prev.filter((x) => x.url !== v.url))}
      removeLabel="Retirer la vidéo"
    />
  ))}

  {competitorRefs.length > 0 && (
    <>
      <span className="gx-ctx-l">
        {competitorRefs.length} référence{competitorRefs.length > 1 ? "s" : ""}
      </span>
      {competitorRefs.map((r) => (
        <AttachChip
          key={r.id}
          kind="Référence"
          name={r.pageName ?? "Annonce"}
          thumb={r.mediaUrl && (r.mediaType === "image" || r.mediaType === "video") ? { src: r.mediaUrl, video: r.mediaType === "video", alt: "" } : undefined}
          icon={<ImageIcon className="gx-i" />}
          onRemove={() => setCompetitorRefs((prev) => prev.filter((x) => x.id !== r.id))}
          removeLabel={`Retirer la référence ${r.pageName ?? ""}`.trim()}
        />
      ))}
    </>
  )}

  {pendingAudios.map((a) => (
    <AttachChip
      key={`pending-audio-${a.url}`}
      kind="Audio"
      name={a.name}
      icon={<AudioWaveform className="gx-i" />}
      onRemove={() => setPendingAudios((prev) => prev.filter((x) => x.url !== a.url))}
      removeLabel="Retirer l'audio"
      wide
    >
      <audio src={a.url} controls preload="metadata" className="gx-att-au" />
    </AttachChip>
  ))}

  {pendingCampaign && (
    <div className="gx-ctx-full">
      <PendingCampaignCard
        campaign={pendingCampaign}
        onRemove={() => setPendingCampaign(null)}
      />
    </div>
  )}

  {replyingTo && (
    <div className="gx-ac gx-ac-wide gx-ac-reply" title={replyingTo.snippet}>
      <span className="gx-ac-th gx-ac-ic" aria-hidden><CornerUpLeft className="gx-i" /></span>
      <span className="gx-ac-tx">
        <span className="gx-ac-k">
          Réponse à{replyingTo.kind !== "text" ? ` ${replyingTo.kind === "video" ? "la vidéo" : replyingTo.kind === "image" ? "l'image" : "au carrousel"}` : ""}
        </span>
        <span className="gx-ac-n">{replyingTo.snippet}</span>
      </span>
      <button type="button" className="gx-ac-x" onClick={() => setReplyingTo(null)} aria-label="Annuler la réponse" title="Annuler">
        <X className="gx-i" />
      </button>
    </div>
  )}
</div>
