import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SocialHub } from "@/components/social/SocialHub";
import "@/styles/gx-social.css";

/*
 * Réseaux sociaux : planifier et publier les créations Growthity sur Instagram, Facebook, TikTok…
 * Onglets Calendrier / Publications / Comptes. Publication via Zernio (fonctions serveur dans src/lib/social.functions.ts).
 */

const Search = z.object({
  tab: z.enum(["calendrier", "publications", "comptes"]).optional(),
  connected: z.string().optional(),
  post: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/reseaux")({
  validateSearch: Search,
  head: () => ({
    meta: [
      { title: "Réseaux sociaux — Growthity" },
      { name: "description", content: "Planifie et publie tes créations sur Instagram, Facebook, TikTok et plus, depuis Growthity." },
    ],
  }),
  component: () => <SocialHub search={Route.useSearch()} />,
});
