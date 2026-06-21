import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogin } from "@/components/AdminLogin";
import { adminIsConfigured, isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const configured = adminIsConfigured();
  const authenticated = configured && (await isAdminAuthenticated());

  return (
    <main className="ambient-shell">
      <div className="ambient-content admin-page page-shell">
        {!configured && (
          <div className="warning-box">
            ADMIN_PASSWORD não está configurado. Defina a variável de ambiente antes de usar o painel.
          </div>
        )}
        {authenticated ? <AdminDashboard /> : <AdminLogin />}
      </div>
    </main>
  );
}
