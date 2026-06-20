import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChartNoAxesColumnIncreasing, Route, ShieldCheck } from "lucide-react";

const steps = [
  { label: "Interesses", value: "Pessoas, tecnologia, organização, criatividade e dados" },
  { label: "Habilidades", value: "Comunicação, paciência, negociação, lógica e foco" },
  { label: "Caminhos", value: "Perfis, cursos gratuitos, vídeos e testes práticos" }
];

export default function HomePage() {
  return (
    <main>
      <section className="home-hero">
        <div className="page-shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Orientação profissional prática</p>
            <h1>Mapa de Aptidão</h1>
            <p className="hero-subtitle">Descubra áreas que combinam com você e receba caminhos gratuitos para começar.</p>
            <p className="hero-text">
              Você responde algumas perguntas sobre interesses, habilidades, rotina, personalidade profissional e objetivos.
              No final, o sistema monta seu perfil e sugere cursos, vídeos e testes práticos.
            </p>
            <div className="hero-actions">
              <Link href="/teste" className="button">
                Começar teste <ArrowRight size={19} />
              </Link>
              <Link href="/privacidade" className="button secondary">
                <ShieldCheck size={18} /> Privacidade
              </Link>
            </div>
            <p className="disclaimer">
              Ferramenta de orientação e autoconhecimento. Não substitui acompanhamento psicológico, clínico ou orientação vocacional definitiva.
            </p>
          </div>

          <div className="map-visual" aria-label="Mapa visual de perfis profissionais">
            <div className="map-node main-node">
              <Route size={26} />
              <span>Seu perfil</span>
            </div>
            <div className="map-track" />
            <div className="map-node node-a">Atendimento</div>
            <div className="map-node node-b">Comercial</div>
            <div className="map-node node-c">Admin</div>
            <div className="map-node node-d">Tecnologia</div>
            <div className="map-node node-e">Marketing</div>
            <div className="map-panel card">
              <ChartNoAxesColumnIncreasing size={20} />
              <strong>Top 3 perfis</strong>
              <span>Compatibilidade, forças e próximos passos.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="page-shell grid-auto">
          {steps.map((step) => (
            <article className="info-card card" key={step.label}>
              <BookOpenCheck size={22} />
              <h2>{step.label}</h2>
              <p>{step.value}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
