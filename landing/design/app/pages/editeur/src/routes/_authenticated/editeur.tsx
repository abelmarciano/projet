import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronLeft, Monitor } from "lucide-react";
import { EditorProjectsGallery } from "@/components/editor/EditorProjectsGallery";

const VideoEditor = lazy(() =>
  import("@/components/editor/VideoEditor").then((m) => ({ default: m.VideoEditor })),
);

export const Route = createFileRoute("/_authenticated/editeur")({
  validateSearch: (search: Record<string, unknown>): { p?: string; v?: string; n?: string; panel?: string; src?: string } => ({
    ...(typeof search.src === "string" && /^[0-9a-f-]{36}$/i.test(search.src) ? { src: search.src } : {}),
    p: typeof search.p === "string" && search.p ? search.p : undefined,
    v: typeof search.v === "string" && search.v ? search.v : undefined,
    n: typeof search.n === "string" && search.n ? search.n : undefined,
    panel: typeof search.panel === "string" && search.panel ? search.panel : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Éditeur vidéo — Growthity" },
      {
        name: "description",
        content:
          "Montez vos publicités : timeline multipiste, filtres, effets, transitions, sous-titres IA et voix off.",
      },
      { property: "og:title", content: "Éditeur vidéo — Growthity" },
      {
        property: "og:description",
        content: "Studio de montage vidéo intégré : effets, transitions, sous-titres IA et export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EditorPage,
});

/** Chargement court : en-tête de la maquette + une ligne de texte, jamais un bloc gris figé. */
const spinner = (
  <div className="gx-page">
    <header className="gx-ph">
      <div>
        <h1>Éditeur vidéo</h1>
        <p>Chargement de l'éditeur…</p>
      </div>
    </header>
  </div>
);

function EditorPage() {
  const { p, v, n, panel, src } = Route.useSearch();
  const navigate = useNavigate();

  if (!p) {
    return (
      <ClientOnly fallback={spinner}>
        <EditorProjectsGallery
          onOpen={(id) => navigate({ to: "/editeur", search: { p: id, v: undefined, n: undefined, panel: undefined } })}
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly fallback={spinner}>
      <EditorViewportGate
        onBack={() => navigate({ to: "/editeur", search: () => ({ p: undefined, v: undefined, n: undefined, panel: undefined }) })}
      >
        <Suspense fallback={spinner}>
          <VideoEditor
            key={`${p}:${v ?? ""}`}
            initialProjectId={p === "new" ? undefined : p}
            initialVideoUrl={v}
            initialVideoName={n}
            initialPanel={panel}
            sourceAdId={src}
            onBack={() =>
              navigate({ to: "/editeur", search: () => ({ p: undefined, v: undefined, n: undefined, panel: undefined }) })
            }
          />
        </Suspense>
      </EditorViewportGate>
    </ClientOnly>
  );
}

function EditorViewportGate({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  const [mobile, setMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (!mobile) return children;

  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Éditeur vidéo</h1>
        </div>
      </header>
      <div className="gx-empty">
        <Monitor className="gx-i" />
        <b>Passe sur ordinateur</b>
        <span>
          L'éditeur vidéo nécessite un grand écran pour déplacer les séquences et régler la timeline avec précision.
        </span>
        <button type="button" className="gx-btn" onClick={onBack}>
          <ChevronLeft className="gx-i" />
          Retour aux projets
        </button>
      </div>
    </div>
  );
}
