import { Mail } from "lucide-react";

/** Moyen de connexion du propriétaire (Google, Apple, Microsoft, e-mail). */
export function ProviderPill({ provider }: { provider: string | null | undefined }) {
  const p = (provider || "email").toLowerCase();
  if (p === "google") {
    return (
      <span className="ad-pill out">
        <svg viewBox="0 0 24 24" aria-hidden><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.05-3.72 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
        Google
      </span>
    );
  }
  if (p === "apple") return <span className="ad-pill out">Apple</span>;
  if (p === "azure" || p === "microsoft") return <span className="ad-pill out">Microsoft</span>;
  return <span className="ad-pill out"><Mail aria-hidden />E-mail</span>;
}
