import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ChevronDown, Film, Loader2, MoreHorizontal, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { VideoPoster } from "@/components/VideoPoster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  createEditorProject,
  deleteEditorProject,
  duplicateEditorProject,
  listDeletedEditorProjects,
  listEditorProjects,
  purgeEditorProject,
  renameEditorProject,
  restoreEditorProject,
} from "@/lib/editor-projects.functions";

/*
 * Éditeur vidéo · liste des projets : en-tête gx-ph et grille de cartes gx-ccard
 * de la maquette validée (landing/design/app/views/creations.html pour la carte).
 */

type ProjectRow = {
  id: string;
  name: string;
  aspect_ratio?: string | null;
  thumbnail_url?: string | null;
  preview_src?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  owner_name?: string | null;
  can_edit?: boolean;
  can_delete?: boolean;
};

/** Nom par défaut daté, identique côté serveur : jamais « Nouveau projet ». */
function defaultProjectName() {
  const now = new Date();
  return `Projet du ${now.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })} à ${now.toLocaleTimeString(
    "fr-FR",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

function formatDate(value?: string | null) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

/**
 * Vignette d'un projet.
 *
 * Correctif « vignettes délavées » : l'ancienne version empilait une <img> en
 * `opacity-0 → opacity-100` (avec `transition`) et la vidéo de secours
 * (VideoPoster, elle aussi en fondu d'opacité) au-dessus d'un fond clair
 * `bg-muted`. Tant qu'une couche n'était pas à 100 % (chargement paresseux,
 * contrôle de luminosité en attente, fondu en cours), le gris clair passait à
 * travers : voile blanc et noirs relevés (~11 % mesurés sur la capture QA).
 * Désormais une seule couche est affichée, toujours opaque, sur fond sombre.
 */
function ProjectThumb({
  src,
  previewSrc,
  name,
}: {
  src?: string | null;
  previewSrc?: string | null;
  name: string;
}) {
  const [state, setState] = useState<"ok" | "blank">(src ? "ok" : "blank");
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    setState(src ? "ok" : "blank");
  }, [src]);

  /** Vignette enregistrée entièrement noire : on bascule sur la 1re image de la vidéo. */
  const handleLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    try {
      const c = document.createElement("canvas");
      c.width = 32;
      c.height = 32;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 32, 32);
      const { data } = ctx.getImageData(0, 0, 32, 32);
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const avg = sum / (data.length / 4);
      if (avg < 8) setState("blank");
    } catch {
      /* lecture des pixels refusée : on garde la vignette */
    }
  };

  if (src && state === "ok") {
    return (
      <img
        ref={imgRef}
        src={src}
        crossOrigin="anonymous"
        alt={`Aperçu du projet ${name}`}
        onLoad={handleLoad}
        onError={() => setState("blank")}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (previewSrc) return <VideoPoster src={previewSrc} />;
  return (
    <span className="gx-pth-0" aria-hidden>
      <Film className="gx-i" />
    </span>
  );
}

const SORT_LABEL = { recent: "Modifié récemment", name: "Nom A → Z" } as const;

export function EditorProjectsGallery({ onOpen }: { onOpen: (id: string | "new") => void }) {
  const queryClient = useQueryClient();
  const listProjects = useServerFn(listEditorProjects);
  const listDeleted = useServerFn(listDeletedEditorProjects);
  const createProject = useServerFn(createEditorProject);
  const removeProject = useServerFn(deleteEditorProject);
  const restoreProject = useServerFn(restoreEditorProject);
  const purgeProject = useServerFn(purgeEditorProject);
  const renameProject = useServerFn(renameEditorProject);
  const duplicateProject = useServerFn(duplicateEditorProject);

  const [tab, setTab] = useState<"projects" | "trash">("projects");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const [confirmDelete, setConfirmDelete] = useState<ProjectRow | null>(null);
  const [confirmPurge, setConfirmPurge] = useState<ProjectRow | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; value: string } | null>(null);

  const projects = useQuery({
    queryKey: ["editor-projects"],
    queryFn: () => listProjects() as Promise<ProjectRow[]>,
    staleTime: 30_000,
  });

  const trash = useQuery({
    queryKey: ["editor-projects", "trash"],
    queryFn: () => listDeleted() as Promise<ProjectRow[]>,
    staleTime: 30_000,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["editor-projects"] });
  };

  const createMutation = useMutation({
    mutationFn: async () => (await createProject({ data: { name: defaultProjectName() } })) as { id: string },
    onSuccess: (row) => {
      refresh();
      onOpen(row.id);
    },
    onError: () => toast.error("Impossible de créer le projet."),
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => restoreProject({ data: { id } }),
    onSuccess: () => {
      toast.success("Projet restauré.");
      refresh();
    },
    onError: () => toast.error("Restauration impossible."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => removeProject({ data: { id } }),
    onSuccess: (_res, id) => {
      refresh();
      toast("Projet supprimé", {
        duration: 8000,
        action: { label: "Annuler", onClick: () => restoreMutation.mutate(id) },
      });
    },
    onError: () => toast.error("Suppression impossible."),
    onSettled: () => setConfirmDelete(null),
  });

  const purgeMutation = useMutation({
    mutationFn: async (id: string) => purgeProject({ data: { id } }),
    onSuccess: () => {
      toast.success("Projet supprimé définitivement.");
      refresh();
    },
    onError: () => toast.error("Suppression définitive impossible."),
    onSettled: () => setConfirmPurge(null),
  });

  const renameMutation = useMutation({
    mutationFn: async (vars: { id: string; name: string }) => renameProject({ data: vars }),
    onSuccess: () => refresh(),
    onError: () => toast.error("Renommage impossible."),
    onSettled: () => setRenaming(null),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => duplicateProject({ data: { id } }),
    onSuccess: () => {
      toast.success("Copie créée.");
      refresh();
    },
    onError: () => toast.error("Duplication impossible."),
  });

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (projects.data ?? []).filter((p) => !q || p.name.toLowerCase().includes(q));
    return [...list].sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name, "fr")
        : new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime(),
    );
  }, [projects.data, query, sort]);

  const trashRows = trash.data ?? [];

  const commitRename = () => {
    if (!renaming) return;
    const name = renaming.value.trim();
    const original = (projects.data ?? []).find((p) => p.id === renaming.id)?.name ?? "";
    if (!name || name === original) return setRenaming(null);
    renameMutation.mutate({ id: renaming.id, name });
  };

  return (
    <div className="gx-page">
      <header className="gx-ph">
        <div>
          <h1>Éditeur vidéo</h1>
          <p>Reprends un projet existant ou démarre un nouveau montage.</p>
        </div>
        <div className="gx-pa">
          <button
            type="button"
            className="gx-btn"
            aria-pressed={tab === "trash"}
            onClick={() => setTab(tab === "trash" ? "projects" : "trash")}
          >
            <Trash2 className="gx-i" />
            {tab === "trash" ? "Retour aux projets" : `Corbeille (${trashRows.length})`}
          </button>
          <button
            type="button"
            className="gx-btn gx-pri"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? <Loader2 className="gx-i animate-spin" /> : <Plus className="gx-i" />}
            Nouveau projet
          </button>
        </div>
      </header>

      {tab === "projects" ? (
        <div className="gx-bar-f">
          <label className="gx-srch gx-grow">
            <Search className="gx-i" />
            <span className="gx-sr">Rechercher un projet</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet…"
              autoComplete="off"
            />
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="gx-sel" aria-label="Trier les projets">
                <span>{SORT_LABEL[sort]}</span>
                <ChevronDown className="gx-i" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="console-app-portal">
              <DropdownMenuItem onSelect={() => setSort("recent")}>Modifié récemment</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSort("name")}>Nom A → Z</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      {tab === "trash" ? (
        trash.isLoading ? (
          <p className="gx-hint">Chargement de la corbeille…</p>
        ) : trashRows.length === 0 ? (
          <div className="gx-empty">
            <b>La corbeille est vide</b>
            <span>Les projets supprimés y restent 30 jours.</span>
          </div>
        ) : (
          <div className="gx-box gx-trash">
            {trashRows.map((p) => (
              <div key={p.id} className="gx-trash-r">
                <div>
                  <b>{p.name}</b>
                  <small>Supprimé le {formatDate(p.deleted_at)} · conservé 30 jours</small>
                </div>
                <div className="gx-pa">
                  <button type="button" className="gx-btn gx-sm" onClick={() => restoreMutation.mutate(p.id)}>
                    <RotateCcw className="gx-i" />
                    Restaurer
                  </button>
                  {p.can_delete === false ? null : (
                    <button type="button" className="gx-btn gx-sm gx-ghost" onClick={() => setConfirmPurge(p)}>
                      Supprimer définitivement
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : projects.isLoading ? (
        <div className="gx-cgrid" aria-busy="true" aria-label="Chargement des projets">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="gx-ccard">
              <span className="gx-pth" />
              <div>
                <b>Chargement…</b>
              </div>
            </div>
          ))}
        </div>
      ) : projects.isError ? (
        <div className="gx-empty">
          <b>Impossible de charger tes projets</b>
          <button type="button" className="gx-btn" onClick={() => void projects.refetch()}>
            Réessayer
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="gx-empty">
          <b>{query ? "Aucun projet ne correspond à cette recherche" : "Aucun projet pour le moment"}</b>
          {!query ? (
            <>
              <span>Crée ton premier montage : timeline multipiste, sous-titres IA, voix off et export.</span>
              <button
                type="button"
                className="gx-btn gx-pri"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
              >
                <Plus className="gx-i" />
                Créer un projet
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <div className="gx-cgrid">
          {rows.map((p) => (
            <div key={p.id} className="gx-ccard">
              <button
                type="button"
                className="gx-pth"
                onClick={() => onOpen(p.id)}
                aria-label={`Ouvrir le projet ${p.name}`}
              >
                <ProjectThumb src={p.thumbnail_url} previewSrc={p.preview_src} name={p.name} />
              </button>
              {p.aspect_ratio ? <span className="gx-ty">{p.aspect_ratio}</span> : null}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="gx-ib gx-sm gx-pmenu" aria-label={`Actions pour ${p.name}`}>
                    <MoreHorizontal className="gx-i" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="console-app-portal">
                  <DropdownMenuItem onSelect={() => onOpen(p.id)}>Ouvrir</DropdownMenuItem>
                  {p.can_edit === false ? null : (
                    <DropdownMenuItem onSelect={() => setRenaming({ id: p.id, value: p.name })}>
                      Renommer
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => duplicateMutation.mutate(p.id)}>Dupliquer</DropdownMenuItem>
                  {p.can_delete === false ? null : (
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setConfirmDelete(p)}>
                      Supprimer
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div>
                {renaming?.id === p.id ? (
                  <input
                    autoFocus
                    className="gx-in gx-ren"
                    value={renaming.value}
                    aria-label={`Renommer ${p.name}`}
                    onChange={(e) => setRenaming({ id: p.id, value: e.target.value })}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename();
                      if (e.key === "Escape") setRenaming(null);
                    }}
                  />
                ) : (
                  <b
                    title={p.name}
                    onDoubleClick={() => p.can_edit !== false && setRenaming({ id: p.id, value: p.name })}
                  >
                    {p.name}
                  </b>
                )}
                <small className="gx-hint">{formatDate(p.updated_at)}</small>
                {p.can_edit === false ? (
                  <span className="gx-st gx-off">Lecture seule · {p.owner_name ?? "un membre de l'équipe"}</span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="console-app-portal">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {confirmDelete?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>Il sera conservé 30 jours dans la corbeille.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmPurge} onOpenChange={(o) => !o && setConfirmPurge(null)}>
        <AlertDialogContent className="console-app-portal">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement « {confirmPurge?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette suppression est définitive et irréversible : le projet ne pourra plus être restauré.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel autoFocus>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmPurge && purgeMutation.mutate(confirmPurge.id)}
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
