import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ position: "relative", zIndex: 1 }}>
      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(40px,6vw,84px) clamp(20px,5vw,40px)", display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: "clamp(36px,6vw,72px)", alignItems: "center" }}>
        <div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 99, background: "var(--primary-soft)", color: "var(--primary-hover)", fontSize: ".82rem", fontWeight: 600, border: "1px solid color-mix(in srgb,var(--primary) 18%,transparent)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="3.2" /></svg>
            Orientação profissional gratuita
          </span>
          <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "clamp(2.7rem,5.4vw,4.6rem)", lineHeight: 1.04, letterSpacing: "-0.025em", margin: "22px 0 0" }}>
            Encontre o caminho que combina com <em style={{ fontStyle: "italic", color: "var(--primary)" }}>você</em>.
          </h1>
          <p style={{ margin: "22px 0 0", color: "var(--muted)", fontSize: "1.18rem", lineHeight: 1.65, maxWidth: 520 }}>
            Um teste de aptidão acolhedor, um currículo profissional e vagas compatíveis com o seu perfil. Tudo num só lugar, com calma e clareza.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 34 }}>
            <Link href="/teste" style={{ display: "inline-flex", alignItems: "center", gap: 10, height: 54, padding: "0 28px", border: "none", borderRadius: 14, background: "var(--primary)", color: "#fff", fontWeight: 600, fontSize: "1.05rem", cursor: "pointer", fontFamily: "var(--font-body)", boxShadow: "0 14px 30px -12px var(--primary-shadow)" }}>
              Fazer meu teste
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <Link href="/cadastro" style={{ display: "inline-flex", alignItems: "center", height: 54, padding: "0 26px", border: "1px solid var(--border-strong)", borderRadius: 14, background: "var(--surface)", color: "var(--text)", fontWeight: 600, fontSize: "1.05rem", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Criar conta grátis
            </Link>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 30, color: "var(--faint)", fontSize: ".9rem", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>100% gratuito</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Sem cobrança</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>Seus dados são seus</span>
          </div>
        </div>

        <div style={{ position: "relative", animation: "floatY 7s ease-in-out infinite" }}>
          <div style={{ position: "relative", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 26, boxShadow: "var(--shadow-lg)", padding: 30, display: "grid", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-head)", fontSize: "1.15rem", fontWeight: 600 }}>Seu mapa de aptidão</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: ".78rem", color: "var(--success)", fontWeight: 600, background: "var(--success-soft)", padding: "4px 10px", borderRadius: 99 }}>● Em progresso</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gap: 7 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: 600 }}><span>Análise</span><span style={{ color: "var(--primary)" }}>92%</span></div><div style={{ height: 9, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: "92%", borderRadius: 99, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div></div>
              <div style={{ display: "grid", gap: 7 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: 600 }}><span>Organização</span><span style={{ color: "var(--primary)" }}>85%</span></div><div style={{ height: 9, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: "85%", borderRadius: 99, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div></div>
              <div style={{ display: "grid", gap: 7 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: 600 }}><span>Criatividade</span><span style={{ color: "var(--primary)" }}>80%</span></div><div style={{ height: 9, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: "80%", borderRadius: 99, background: "linear-gradient(90deg,var(--primary),#5a93f7)" }} /></div></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 13, padding: 15, borderRadius: 16, background: "var(--primary-soft)", border: "1px solid color-mix(in srgb,var(--primary) 15%,transparent)" }}>
              <span style={{ display: "inline-flex", width: 40, height: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 11, background: "var(--primary)", color: "#fff" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2zM9 21h6M10 17v4M14 17v4" /></svg></span>
              <span style={{ fontSize: ".92rem", color: "var(--text)", lineHeight: 1.45 }}>Perfil sugerido: <strong style={{ color: "var(--primary-hover)" }}>Analista de Dados</strong></span>
            </div>
          </div>
          <div style={{ position: "absolute", top: -18, left: -22, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "var(--shadow-card)", padding: "11px 15px", display: "flex", alignItems: "center", gap: 9, fontSize: ".85rem", fontWeight: 600, animation: "floatY 5s ease-in-out infinite" }}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>Teste concluído</div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,5vw,40px) clamp(30px,5vw,60px)" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
          <span style={{ fontSize: ".8rem", letterSpacing: ".16em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>Como funciona</span>
          <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "clamp(1.9rem,3.5vw,2.7rem)", letterSpacing: "-0.02em", margin: "12px 0 0" }}>Três passos, sem pressa</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-card)", padding: 30, display: "grid", gap: 14 }}>
            <span style={{ display: "inline-flex", width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.3rem", margin: 0 }}>1 · Responda o teste</h3>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>Perguntas simples sobre o que você gosta e como trabalha. Leva poucos minutos.</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-card)", padding: 30, display: "grid", gap: 14 }}>
            <span style={{ display: "inline-flex", width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 16l4-6 3 4 4-7" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.3rem", margin: 0 }}>2 · Descubra seus perfis</h3>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>Veja carreiras compatíveis, suas forças e pontos de atenção, com clareza.</p>
          </div>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-card)", padding: 30, display: "grid", gap: 14 }}>
            <span style={{ display: "inline-flex", width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "var(--primary-soft)", color: "var(--primary)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg></span>
            <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.3rem", margin: 0 }}>3 · Receba um plano</h3>
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>Cursos gratuitos, um currículo pronto e vagas que combinam com você.</p>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "clamp(20px,4vw,50px) clamp(20px,5vw,40px) clamp(40px,6vw,80px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          <Link href="/teste" style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            <strong style={{ fontSize: "1.05rem" }}>Teste de aptidão</strong>
            <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>Descubra suas aptidões naturais</span>
          </Link>
          <Link href="/perfil" style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>
            <strong style={{ fontSize: "1.05rem" }}>Currículo profissional</strong>
            <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>20 templates e pontuação ATS</span>
          </Link>
          <Link href="/vagas" style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            <strong style={{ fontSize: "1.05rem" }}>Vagas compatíveis</strong>
            <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>Busca alinhada ao seu perfil</span>
          </Link>
          <Link href="/perfil" style={{ textAlign: "left", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 18, boxShadow: "var(--shadow-card)", padding: 24, display: "grid", gap: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <strong style={{ fontSize: "1.05rem" }}>Mentor IA</strong>
            <span style={{ color: "var(--muted)", fontSize: ".92rem", lineHeight: 1.5 }}>Orientação baseada no seu perfil</span>
          </Link>
        </div>
        <p style={{ margin: "30px auto 0", maxWidth: 760, textAlign: "center", color: "var(--faint)", fontSize: ".88rem", lineHeight: 1.6 }}>O Minha Aptidão não substitui orientação psicológica, clínica ou vocacional profissional. É uma ferramenta de apoio ao autoconhecimento.</p>
      </section>
    </main>
  );
}
