import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAdminAccessStatus } from "@/lib/admin/functions";
import { Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavProvider } from "@/components/admin/AdminNav";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
  },
  component: AdminLayout,
});

function AdminLayout() {
  const fetchAccessStatus = useServerFn(getAdminAccessStatus);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => fetchAccessStatus(),
    retry: false,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    const msg = (error as Error).message ?? "";
    if (msg.includes("MFA_REQUIRED")) return <MfaWaiting />;
    return <AccessDenied />;
  }
  if (!data) return <AccessDenied />;
  if (!data.ok) {
    if (data.code === "MFA_REQUIRED") return <MfaWaiting />;
    return <AccessDenied />;
  }

  return (
    <AdminNavProvider>
      {(open) => (
        <div className={`console-app gx-ad${open ? " ad-nav-open" : ""}`}>
          <AdminSidebar email={data.email} isSuper={data.isSuper} />
          <main className="ad-main">
            <Outlet />
          </main>
        </div>
      )}
    </AdminNavProvider>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <ShieldAlert className="h-10 w-10 text-destructive" />
      <h1 className="text-xl font-semibold">Accès refusé</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Cet espace est réservé à l'équipe interne Growthity. Si tu penses que c'est une erreur, contacte un super-admin.
      </p>
      <Link to="/create" className="mt-2 text-sm text-primary hover:underline">Retour à l'app</Link>
    </div>
  );
}

// The global MfaChallengeGate (mounted in __root) handles the TOTP prompt,
// but only when a verified factor exists. Otherwise the admin must enroll first.
function MfaWaiting() {
  const { data: factors, isLoading } = useQuery({
    queryKey: ["mfa-factors"],
    queryFn: async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      return data?.totp?.filter((f) => f.status === "verified") ?? [];
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!factors || factors.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <ShieldAlert className="h-10 w-10 text-primary" />
        <h1 className="text-xl font-semibold">Double authentification requise</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          L'espace admin exige la 2FA. Active-la depuis tes paramètres de sécurité, puis reviens ici.
        </p>
        <Link to="/parametres/securite" className="mt-2 text-sm text-primary hover:underline">
          Activer la 2FA
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <ShieldCheck className="h-10 w-10 text-primary" />
      <h1 className="text-xl font-semibold">Vérification 2FA en cours</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Entre le code à 6 chiffres depuis la fenêtre de vérification qui vient de s'ouvrir.
      </p>
      <Loader2 className="mt-2 h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}
