import { frError } from "@/lib/error-fr";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, Play, Mic2 } from "@/components/icons";
import {
  listVoiceLabCatalog,
  generateVoiceLabSample,
} from "@/lib/admin/voice-lab.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/voice-lab")({
  head: () => ({ meta: [{"title": "Voice Lab — Admin Growthity"}, {"name": "description", "content": "Espace interne Growthity : Voice Lab."}, {"property": "og:title", "content": "Voice Lab — Admin Growthity"}, {"property": "og:description", "content": "Espace interne Growthity : Voice Lab."}, {"property": "og:type", "content": "website"}, {"name": "twitter:card", "content": "summary"}] }),
  component: VoiceLabPage,
});

const DEFAULT_TEXT =
  "Franchement, ce produit a changé ma routine du quotidien. Je le recommande à 100%, essayez-le, vous verrez la différence dès la première semaine.";

function VoiceLabPage() {
  const fetchCatalog = useServerFn(listVoiceLabCatalog);
  const genSample = useServerFn(generateVoiceLabSample);
  const { data, isLoading } = useQuery({
    queryKey: ["voice-lab-catalog"],
    queryFn: () => fetchCatalog(),
    staleTime: 5 * 60_000,
  });
  const [text, setText] = useState(DEFAULT_TEXT);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  async function play(voiceId: string) {
    setPending((p) => ({ ...p, [voiceId]: true }));
    try {
      const r = await genSample({ data: { voiceId, text } });
      setUrls((u) => ({ ...u, [voiceId]: r.url }));
    } catch (e) {
      toast.error(frError(e));
    } finally {
      setPending((p) => ({ ...p, [voiceId]: false }));
    }
  }

  const voices = data?.voices ?? [];

  return (
    <>
      <AdminTopBar title="Voice Lab" subtitle="Écoute et compare les voix candidates avant de fixer les sélections." />
      <div className="ad-page">
        <section className="ad-card">
          <div className="ad-cb">
            <div className="ad-fld">
              <label htmlFor="vl-text">Texte à synthétiser</label>
              <textarea
                id="vl-text"
                className="ad-ta"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                maxLength={600}
              />
              <span className="ad-hint ad-num">{text.length}/600 caractères</span>
            </div>
          </div>
        </section>

        {isLoading ? (
          <section className="ad-card">
            <div className="ad-loading" role="status">
              <Loader2 className="ad-i ad-spin" aria-hidden />
              <span className="ad-vl-ld">Chargement du catalogue…</span>
            </div>
          </section>
        ) : voices.length === 0 ? (
          <section className="ad-card">
            <div className="ad-empty">
              <b>Aucune voix dans le catalogue</b>
              Le catalogue des voix candidates est vide.
            </div>
          </section>
        ) : (
          <div className="ad-g2e">
            {voices.map((v) => (
              <section key={v.id} className="ad-card ad-vl">
                <div className="ad-vl-h">
                  <span className="ad-vl-ic"><Mic2 className="ad-i" aria-hidden /></span>
                  <div className="ad-grow">
                    <b>
                      {v.name}{" "}
                      <span className="ad-pill out">{v.gender === "female" ? "F" : "H"}</span>
                    </b>
                    <small>{v.notes}</small>
                    <code className="ad-vl-id">{v.id}</code>
                  </div>
                  <button
                    type="button"
                    className="ad-btn sm"
                    onClick={() => play(v.id)}
                    disabled={pending[v.id] || !text.trim()}
                    aria-label={pending[v.id] ? "Génération en cours" : `Générer un extrait avec ${v.name}`}
                  >
                    {pending[v.id] ? (
                      <Loader2 className="ad-i ad-spin" aria-hidden />
                    ) : (
                      <>
                        <Play className="ad-i" aria-hidden /> Générer
                      </>
                    )}
                  </button>
                </div>
                {urls[v.id] && (
                  <audio controls src={urls[v.id]} className="ad-vl-audio" preload="none" />
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
