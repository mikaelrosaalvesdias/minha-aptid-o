import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, UserCircle, LogOut, Briefcase, Sparkles } from "lucide-react";
import { getUser, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TopProfileResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  const sessions = await prisma.userSession.findMany({
    where: { userId: user.id },
    include: { result: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="page-shell">
      <div className="card" style={{ padding: "32px", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <UserCircle size={48} style={{ color: "var(--primary-color)" }} />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5rem" }}>{user.name}</h1>
              <p className="muted" style={{ margin: 0 }}>{user.email}</p>
            </div>
          </div>
          <form action={async () => {
            "use server";
            await clearSession();
            redirect("/");
          }}>
            <button className="button secondary">
              <LogOut size={16} /> Sair
            </button>
          </form>
        </div>
      </div>

      <div className="card" style={{ padding: "24px", marginBottom: "32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", borderColor: "rgba(16,185,129,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Briefcase size={32} style={{ color: "#10b981" }} />
          <div>
            <h2 style={{ margin: 0, fontSize: "1.3rem" }}>Área de Vagas</h2>
            <p className="muted" style={{ margin: "4px 0 0" }}>Busque vagas compatíveis com seu perfil e candidate-se usando seu currículo salvo.</p>
          </div>
        </div>
        <Link href="/vagas" className="button" style={{ backgroundColor: "#10b981", flexShrink: 0 }}>
          Ir para Vagas <ArrowRight size={16} />
        </Link>
      </div>

      <h2>Seus Mapas de Aptidão Salvos</h2>
      {sessions.length === 0 ? (
        <div className="card" style={{ padding: "32px", textAlign: "center", marginTop: "16px" }}>
          <p>Você ainda não tem testes salvos.</p>
          <Link href="/teste" className="button" style={{ marginTop: "16px" }}>
            Fazer meu primeiro teste <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px", marginTop: "16px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {sessions.map((session) => {
            if (!session.result) return null;
            
            let mainProfileName = "Em construção";
            try {
              const topProfiles = session.result.topProfiles as TopProfileResult[];
              if (topProfiles && topProfiles.length > 0) {
                mainProfileName = topProfiles[0].name;
              }
            } catch (e) {}
            
            return (
              <div key={session.id} className="card" style={{ padding: "24px" }}>
                <p className="eyebrow" style={{ marginBottom: "8px" }}>
                  {new Intl.DateTimeFormat("pt-BR", { 
                    day: "2-digit", month: "long", year: "numeric" 
                  }).format(session.createdAt)}
                </p>
                <h3 style={{ margin: "0 0 16px 0" }}>{mainProfileName}</h3>
                <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                  <Link href={`/resultado/${session.result.id}`} className="button secondary" style={{ flex: 1 }}>
                    Ver Mapa Completo
                  </Link>
                  <Link href={`/curriculo/${session.result.id}`} className="button" style={{ flex: 1, backgroundColor: "#10b981" }}>
                    Gerar Currículo
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Link href="/sobre" className="card" style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px", marginTop: "8px", textDecoration: "none" }}>
        <Sparkles size={20} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>Novidades e versões</p>
          <p className="muted" style={{ margin: "2px 0 0", fontSize: "0.9rem" }}>Veja o que mudou no app e o histórico de atualizações.</p>
        </div>
        <ArrowRight size={18} style={{ color: "var(--text-muted)" }} />
      </Link>
    </main>
  );
}
