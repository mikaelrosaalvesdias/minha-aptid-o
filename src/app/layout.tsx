import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BrandLogo } from "@/components/BrandLogo";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mapa de Aptidão",
  description: "Descubra áreas que combinam com você e receba caminhos gratuitos para começar."
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  let unreadJobs = 0;
  if (user) {
    unreadJobs = await prisma.jobNotification.count({ where: { userId: user.id, read: false } });
  }

  return (
    <html lang="pt-BR">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Mapa de Aptidão">
            <span className="brand-mark">
              <BrandLogo size={24} />
            </span>
            <span>Mapa de Aptidão</span>
          </Link>
          <nav className="nav-links" aria-label="Navegação principal">
            <Link href="/teste">Teste</Link>
            {user && <Link href="/vagas">Vagas{unreadJobs > 0 && <span className="badge-count" style={{ display: "inline-flex", minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", marginLeft: 6, padding: "0 5px", borderRadius: 999, background: "var(--accent-primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>{unreadJobs}</span>}</Link>
            }
            <Link href="/privacidade">Privacidade</Link>
            {user ? (
              <Link href="/perfil" className="button secondary" style={{ padding: "8px 16px" }}>Meu Perfil</Link>
            ) : (
              <Link href="/login" className="button ghost">Entrar</Link>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
