import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { getUser, clearSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TopProfileResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const sessions = await prisma.userSession.findMany({
    where: { userId: user.id },
    include: { result: true },
    orderBy: { createdAt: "desc" }
  });

  const resumeVersions = await prisma.resumeVersion.count({ where: { userId: user.id } });
  const jobApps = await prisma.jobApplication.count({ where: { userId: user.id } });
  const pendingApps = await prisma.jobApplication.count({ where: { userId: user.id, status: { in: ["aguardando", "em_andamento", "acao_manual"] } } });

  const initials = user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const memberSince = sessions[0]?.createdAt ?? new Date();
  const memberDate = new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(memberSince);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(30px,5vw,56px) clamp(20px,5vw,40px)", display: "grid", gap: 24 }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "var(--shadow-card)", padding: "clamp(24px,4vw,36px)", display: "flex", flexWrap: "wrap", gap: 22, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ display: "inline-flex", width: 74, height: 74, alignItems: "center", justifyContent: "center", borderRadius: 22, background: "linear-gradient(140deg,var(--primary),#5a93f7)", color: "#fff", fontFamily: "var(--font-head)", fontSize: "1.9rem", fontWeight: 600, boxShadow: "0 12px 26px -12px var(--primary-shadow)" }}>{initials}</span>
          <div>
            <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "1.8rem", margin: 0, letterSpacing: "-0.02em" }}>{user.name}</h1>
            <p style={{ margin: "5px 0 0", color: "var(--muted)" }}>{user.email} · Membro desde {memberDate}</p>
          </div>
        </div>
        <form action={async () => { "use server"; await clearSession(); redirect("/"); }}>
          <button type="submit" style={{ display: "inline-flex", alignItems: "center", gap: 9, height: 46, padding: "0 20px", border: "1px solid var(--border-strong)", borderRadius: 12, background: "var(--surface)", color: "var(--text)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <LogOut size={17} /> Sair
          </button>
        </form>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)", fontSize: ".85rem", fontWeight: 600 }}>Teste de aptidão</span>
          <strong style={{ fontSize: "1.5rem", fontFamily: "var(--font-head)", fontWeight: 600 }}>{sessions.length > 0 ? "Concluído" : "Pendente"}</strong>
          <span style={{ color: sessions.length > 0 ? "var(--success)" : "var(--muted)", fontSize: ".85rem", fontWeight: 600 }}>{sessions.length > 0 ? "Resultado disponível" : "Faça o teste"}</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)", fontSize: ".85rem", fontWeight: 600 }}>Currículos</span>
          <strong style={{ fontSize: "1.5rem", fontFamily: "var(--font-head)", fontWeight: 600 }}>{resumeVersions} versão{resumeVersions !== 1 ? "ões" : ""}</strong>
          <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>{sessions.length > 0 ? "Editor disponível" : "Crie seu currículo"}</span>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 6 }}>
          <span style={{ color: "var(--muted)", fontSize: ".85rem", fontWeight: 600 }}>Vagas na fila</span>
          <strong style={{ fontSize: "1.5rem", fontFamily: "var(--font-head)", fontWeight: 600 }}>{jobApps} vaga{jobApps !== 1 ? "s" : ""}</strong>
          {pendingApps > 0 && <span style={{ color: "var(--warning)", fontSize: ".85rem", fontWeight: 600 }}>{pendingApps} aguardando ação</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {sessions.length > 0 && sessions.map((session) => {
          if (!session.result) return null;
          let mainProfileName = "Em construção";
          try {
            const topProfiles = session.result.topProfiles as TopProfileResult[];
            if (topProfiles && topProfiles.length > 0) mainProfileName = topProfiles[0].name;
          } catch {}
          return (
            <Link key={session.id} href={`/resultado/${session.result.id}`} style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "flex", gap: 16, alignItems: "center", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              <span style={{ display: "inline-flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)", flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-6 3 4 4-7" /></svg>
              </span>
              <span style={{ display: "grid", gap: 3 }}>
                <strong style={{ fontSize: "1.05rem" }}>Ver resultado: {mainProfileName}</strong>
                <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>{new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(session.createdAt)}</span>
              </span>
            </Link>
          );
        })}
        {sessions.length > 0 && (
          <Link href={`/curriculo/${sessions[0].result?.id ?? ""}`} style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "flex", gap: 16, alignItems: "center", cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <span style={{ display: "inline-flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
            </span>
            <span style={{ display: "grid", gap: 3 }}>
              <strong style={{ fontSize: "1.05rem" }}>Editar meu currículo</strong>
              <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>Templates, pontuação e exportação</span>
            </span>
          </Link>
        )}
        <Link href="/vagas" style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "flex", gap: 16, alignItems: "center", cursor: "pointer", fontFamily: "var(--font-body)" }}>
          <span style={{ display: "inline-flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          </span>
          <span style={{ display: "grid", gap: 3 }}>
            <strong style={{ fontSize: "1.05rem" }}>Minhas vagas</strong>
            <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>Fila, histórico e notificações</span>
          </span>
        </Link>
        <Link href="/sobre" style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "flex", gap: 16, alignItems: "center", cursor: "pointer", fontFamily: "var(--font-body)" }}>
          <span style={{ display: "inline-flex", width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
          </span>
          <span style={{ display: "grid", gap: 3 }}>
            <strong style={{ fontSize: "1.05rem" }}>Sobre e novidades</strong>
            <span style={{ color: "var(--muted)", fontSize: ".9rem" }}>Versões e changelog</span>
          </span>
        </Link>
      </div>
    </main>
  );
}
