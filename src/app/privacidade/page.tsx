export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 780, margin: "0 auto", padding: "clamp(34px,6vw,72px) clamp(20px,5vw,40px)", display: "grid", gap: 24 }}>
      <span style={{ fontSize: ".8rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--primary)", fontWeight: 700 }}>Privacidade</span>
      <h1 style={{ fontFamily: "var(--font-head)", fontWeight: 500, fontSize: "clamp(2.2rem,4.6vw,3.2rem)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: 0 }}>Seus dados são seus</h1>

      <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "18px 22px", background: "var(--primary-soft)", border: "1px solid color-mix(in srgb,var(--primary) 18%,transparent)", borderRadius: 16, color: "var(--text)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <span style={{ fontSize: ".96rem", lineHeight: 1.5 }}>Nunca armazenamos senhas de plataformas de terceiros e não tentamos burlar login, captcha ou bloqueios.</span>
      </div>

      <div style={{ display: "grid", gap: 22, color: "var(--muted)", lineHeight: 1.75, fontSize: "1.02rem" }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.2rem", margin: "0 0 8px", color: "var(--text)" }}>O que coletamos</h3>
          <p style={{ margin: 0 }}>Apenas o necessário para o funcionamento: dados do seu perfil, respostas do teste e o conteúdo do seu currículo. Tudo para gerar suas recomendações.</p>
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.2rem", margin: "0 0 8px", color: "var(--text)" }}>Seu controle</h3>
          <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
            <li>Você pode editar ou remover seus arquivos a qualquer momento.</li>
            <li>Candidaturas só acontecem com o seu consentimento.</li>
            <li>Você pode apagar sua conta e seus dados.</li>
          </ul>
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: "1.2rem", margin: "0 0 8px", color: "var(--text)" }}>Portais externos</h3>
          <p style={{ margin: 0 }}>Greenhouse, LinkedIn, Indeed e outros são tratados conforme suas regras públicas. Quando exigem ação manual, preparamos um pacote para você concluir com segurança.</p>
        </div>
      </div>
    </main>
  );
}
