import type { Metadata } from "next";
import Link from "next/link";
import { Newsreader, Public_Sans } from "next/font/google";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BrandLogo } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const head = Newsreader({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-head", display: "swap" });
const body = Public_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Minha Aptidão — Mapa de carreira",
  description: "Teste de aptidão, currículo profissional e vagas compatíveis com seu perfil. Tudo num só lugar, com calma e clareza."
};

const themeScript = `(function(){try{var t=localStorage.getItem('ma_theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.dataset.theme='dark';}else{document.documentElement.dataset.theme='';}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  let unreadJobs = 0;
  if (user) {
    unreadJobs = await prisma.jobNotification.count({ where: { userId: user.id, read: false } });
  }

  return (
    <html lang="pt-BR" className={`${head.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="Minha Aptidão">
            <span className="brand-mark">
              <BrandLogo size={22} />
            </span>
            <span>Minha Aptidão</span>
          </Link>
          <nav className="nav-links" aria-label="Navegação principal">
            <Link href="/teste">Teste</Link>
            {user && (
              <Link href="/vagas">
                Vagas
                {unreadJobs > 0 && (
                  <span className="badge-count" style={{ display: "inline-flex", minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", marginLeft: 6, padding: "0 5px", borderRadius: 999, background: "var(--primary)", color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>{unreadJobs}</span>
                )}
              </Link>
            )}
            <Link href="/sobre">Sobre</Link>
            <Link href="/privacidade">Privacidade</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            {user ? (
              <Link href="/perfil" className="button secondary" style={{ padding: "8px 16px", minHeight: 42 }}>Meu Perfil</Link>
            ) : (
              <Link href="/login" className="button" style={{ padding: "8px 18px", minHeight: 42 }}>Entrar</Link>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
