import { frError } from "@/lib/error-fr";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, PlayCircle, RefreshCw, ExternalLink, Film, Image as ImageIcon } from "@/components/icons";
import {
  VIDEO_MODELS,
  IMAGE_MODELS,
  ALL_VIDEO_MODEL_KEYS,
  ALL_IMAGE_MODEL_KEYS,
} from "@/lib/generation-routing";
import { listModelLabBatches, pollModelLabBatch, startModelLabBatch } from "@/lib/model-lab.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/model-lab")({
  component: ModelLabPage,
  head: () => ({ meta: [{"title": "Model Lab · Admin · Growthity"}, {"name": "description", "content": "Espace interne Growthity : Model Lab · Admin · Growthity."}, {"property": "og:title", "content": "Model Lab · Admin · Growthity"}, {"property": "og:description", "content": "Espace interne Growthity : Model Lab · Admin · Growthity."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
});

function ModelLabPage() {
  const start = useServerFn(startModelLabBatch);
  const poll = useServerFn(pollModelLabBatch);
  const list = useServerFn(listModelLabBatches);
  const qc = useQueryClient();

  const [kind, setKind] = useState<"video" | "image">("video");
  const [brief, setBrief] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [aspect, setAspect] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [duration, setDuration] = useState(8);
  const [videoSel, setVideoSel] = useState<string[]>(["seedance-2", "kling-3", "happyhorse-1", "veo-3.1"]);
  const [imageSel, setImageSel] = useState<string[]>(["gemini-3-pro-image", "nano-banana-2", "nano-banana"]);

  const { data: rows = [] } = useQuery({
    queryKey: ["model-lab-rows"],
    queryFn: () => list(),
    refetchInterval: 4000,
  });

  const submit = useMutation({
    mutationFn: async () => {
      if (!brief.trim()) throw new Error("Brief requis");
      return start({
        data: {
          kind,
          brief: brief.trim(),
          aspectRatio: aspect,
          durationSec: duration,
          imageUrl: imageUrl.trim() || undefined,
          videoModels: kind === "video" ? (videoSel as never) : undefined,
          imageModels: kind === "image" ? (imageSel as never) : undefined,
        },
      });
    },
    onSuccess: (res) => {
      toast.success(`Comparatif lancé (${res.submitted}/${res.total} modèles)`);
      qc.invalidateQueries({ queryKey: ["model-lab-rows"] });
    },
    onError: (e: Error) => toast.error(frError(e)),
  });

  const pollNow = useMutation({
    mutationFn: async (batchId: string) => poll({ data: { batchId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["model-lab-rows"] }),
  });

  const batches = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const r of rows) {
      const arr = map.get(r.batch_id) ?? [];
      arr.push(r);
      map.set(r.batch_id, arr);
    }
    return Array.from(map.entries()).sort(
      ([, a], [, b]) => new Date(b[0].created_at).getTime() - new Date(a[0].created_at).getTime(),
    );
  }, [rows]);

  const toggle = (arr: string[], set: (v: string[]) => void, k: string) =>
    arr.includes(k) ? set(arr.filter((x) => x !== k)) : set([...arr, k]);


  return (
    <>
      <AdminTopBar title="Model Lab" subtitle="Compare les modèles IA côte à côte sur un même brief avant de basculer le routage." />
      <div className="ad-page">
        <section className="ad-card">
          <div className="ad-ch ad-lab-ch">
            <div>
              <h2>Nouveau test</h2>
              <small>Le même brief est envoyé à chaque modèle sélectionné.</small>
            </div>
            <div className="ad-r">
              <div className="ad-seg" role="group" aria-label="Type de génération">
                <button type="button" aria-pressed={kind === "video"} onClick={() => setKind("video")}>
                  Vidéo
                </button>
                <button type="button" aria-pressed={kind === "image"} onClick={() => setKind("image")}>
                  Image
                </button>
              </div>
            </div>
          </div>
          <div className="ad-cb ad-lab-form">
            <div className="ad-fld">
              <label htmlFor="ml-brief">Brief / consigne</label>
              <textarea
                id="ml-brief"
                className="ad-ta"
                rows={4}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                placeholder="Ex. : une femme présente une crème naturelle face caméra, dans une chambre éclairée chaleureusement…"
              />
            </div>

            <div className="ad-lab-g3">
              <div className="ad-fld">
                <label htmlFor="ml-img">Image de départ <span>(facultatif)</span></label>
                <div className="ad-inp">
                  <input
                    id="ml-img"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="ad-fld">
                <label htmlFor="ml-ratio">Ratio</label>
                <select
                  id="ml-ratio"
                  className="ad-sel"
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value as typeof aspect)}
                >
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="16:9">16:9</option>
                </select>
              </div>
              {kind === "video" && (
                <div className="ad-fld">
                  <label htmlFor="ml-dur">Durée (s)</label>
                  <div className="ad-inp">
                    <input
                      id="ml-dur"
                      type="number"
                      min={4}
                      max={20}
                      value={duration}
                      onChange={(e) => setDuration(Math.max(4, Math.min(20, Number(e.target.value) || 8)))}
                      className="ad-num"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="ad-fld">
              <label>Modèles à comparer</label>
              <div className="ad-feat">
                {(kind === "video" ? ALL_VIDEO_MODEL_KEYS : ALL_IMAGE_MODEL_KEYS).map((k) => {
                  const def =
                    kind === "video"
                      ? VIDEO_MODELS[k as keyof typeof VIDEO_MODELS]
                      : IMAGE_MODELS[k as keyof typeof IMAGE_MODELS];
                  const sel = kind === "video" ? videoSel : imageSel;
                  const setSel = kind === "video" ? setVideoSel : setImageSel;
                  const active = sel.includes(k);
                  return (
                    <button
                      key={k}
                      type="button"
                      className="ad-chipf"
                      aria-pressed={active}
                      onClick={() => toggle(sel, setSel, k)}
                    >
                      {def.label}
                      {def.status !== "active" && <small className="ad-muted">· {def.status}</small>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <button
                type="button"
                className="ad-btn pri"
                onClick={() => submit.mutate()}
                disabled={submit.isPending}
              >
                {submit.isPending ? <Loader2 className="ad-i ad-spin" aria-hidden /> : <PlayCircle className="ad-i" aria-hidden />}
                Lancer le comparatif
              </button>
            </div>
          </div>
        </section>

        <div className="ad-lab-h">
          <h2>Historique des comparatifs</h2>
          <small>Actualisé automatiquement toutes les 4 secondes.</small>
        </div>
        {batches.length === 0 && (
          <section className="ad-card">
            <div className="ad-empty">
              <b>Aucun test lancé pour l'instant</b>
              Lance un premier comparatif ci-dessus.
            </div>
          </section>
        )}
        {batches.map(([batchId, runs]) => {
          const anyRunning = runs.some((r) => r.status === "running");
          const isVideo = runs[0].kind === "video";
          return (
            <section key={batchId} className="ad-card">
              <div className="ad-ch ad-lab-ch">
                <div className="ad-lab-bt">
                  <span className={`ad-pill ${isVideo ? "pri" : "info"}`}>
                    {isVideo ? <Film className="ad-i" aria-hidden /> : <ImageIcon className="ad-i" aria-hidden />}
                    {isVideo ? "Vidéo" : "Image"}
                  </span>
                  <h2 title={runs[0].brief}>{runs[0].brief.slice(0, 100)}</h2>
                  <small>
                    {new Date(runs[0].created_at).toLocaleString("fr-FR")} · lot {batchId.slice(0, 8)}
                  </small>
                </div>
                {anyRunning && isVideo && (
                  <div className="ad-r">
                    <button
                      type="button"
                      className="ad-btn sm"
                      onClick={() => pollNow.mutate(batchId)}
                      disabled={pollNow.isPending}
                    >
                      <RefreshCw className={`ad-i${pollNow.isPending ? " ad-spin" : ""}`} aria-hidden />
                      Rafraîchir
                    </button>
                  </div>
                )}
              </div>
              <div className="ad-cb">
                <div className="ad-lab-runs">
                  {runs.map((r) => (
                    <div key={r.id} className="ad-lab-run">
                      <div className="ad-lab-rh">
                        <b className="ad-lab-model" title={r.model_key}>{r.model_key}</b>
                        <span
                          className={`ad-pill ${
                            r.status === "completed" ? "ok" : r.status === "failed" ? "bad" : "warn"
                          }`}
                        >
                          {r.status === "completed" ? "Terminé" : r.status === "failed" ? "Échoué" : "En cours"}
                        </span>
                      </div>
                      {r.status === "completed" && r.output_url && r.kind === "video" && (
                        <video src={r.output_url} controls className="ad-lab-media ad-lab-916" />
                      )}
                      {r.status === "completed" && r.output_url && r.kind === "image" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.output_url} alt="" className="ad-lab-media" />
                      )}
                      {r.status === "running" && (
                        <div className="ad-lab-wait" role="status">
                          <Loader2 className="ad-i ad-spin" aria-hidden /> En cours…
                        </div>
                      )}
                      {r.status === "failed" && (
                        <div className="ad-lab-err">
                          {frError(r.error_message, "Le test a échoué.")}
                        </div>
                      )}
                      <div className="ad-lab-rf">
                        <span className="ad-num">
                          {r.latency_ms ? `${(r.latency_ms / 1000).toFixed(1)} s` : "-"}
                          {r.cost_estimate_usd ? ` · ~$${Number(r.cost_estimate_usd).toFixed(3)}` : ""}
                        </span>
                        {r.output_url && (
                          <a
                            href={r.output_url}
                            target="_blank"
                            rel="noreferrer"
                            className="ad-ib ad-lab-open"
                            aria-label="Ouvrir le résultat dans un nouvel onglet"
                            title="Ouvrir le résultat"
                          >
                            <ExternalLink className="ad-i" aria-hidden />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
