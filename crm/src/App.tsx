import { useCallback, useState } from "react";
import { Header, type Page } from "@/components/Header";
import { ClientDrawer } from "@/components/ClientDrawer";
import { Toaster } from "@/components/Toaster";
import { ClientsPage } from "@/pages/ClientsPage";
import { PlanningPage } from "@/pages/PlanningPage";
import { StoreProvider } from "@/lib/store";

export default function App() {
  const [page, setPage] = useState<Page>("clients");
  const [openId, setOpenId] = useState<number | null>(null);
  const close = useCallback(() => setOpenId(null), []);

  return (
    <StoreProvider>
      <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_0%_-10%,#e0e9ff_0%,transparent_60%),radial-gradient(900px_500px_at_100%_0%,#f3e8ff_0%,transparent_55%)] bg-slate-50">
        <Header page={page} onPage={setPage} onOpenClient={setOpenId} />
        {page === "clients" ? <ClientsPage onOpen={setOpenId} /> : <PlanningPage onOpen={setOpenId} />}
        <ClientDrawer id={openId} onClose={close} />
        <Toaster />
      </div>
    </StoreProvider>
  );
}
