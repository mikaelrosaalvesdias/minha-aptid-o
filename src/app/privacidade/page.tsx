import Link from "next/link";
import { ArrowLeft, ShieldCheck, Trash2, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  return (
    <main className="section">
      <div className="page-shell privacy-page">
        <Link href="/" className="button ghost">
          <ArrowLeft size={18} /> Voltar
        </Link>
        <div className="privacy-card card">
          <ShieldCheck size={34} />
          <h1>Privacidade e LGPD</h1>
          <p>
            O Mapa de Aptidão usa suas respostas apenas para gerar o resultado do teste, sugerir perfis profissionais,
            cursos gratuitos, vídeos, testes práticos e buscar vagas compatíveis. Nome e e-mail são opcionais.
          </p>
          <ul>
            <li>Você pode fazer o teste sem informar nome ou e-mail.</li>
            <li>Não coletamos dados sensíveis desnecessários.</li>
            <li>Não vendemos nem compartilhamos seus dados pessoais.</li>
            <li>O resultado é acessado por um identificador único e não aparece para outros visitantes.</li>
            <li>Na página de resultado existe um botão para apagar a sessão e suas respostas.</li>
          </ul>
          <div className="warning-box">
            <Trash2 size={18} />
            <span>Apagar o resultado remove a sessão, respostas e resultado vinculados no banco de dados.</span>
          </div>
        </div>

        <div className="privacy-card card">
          <Lock size={34} />
          <h2>Área de Vagas e candidaturas</h2>
          <p>
            A área de Vagas busca oportunidades compatíveis com seu perfil e pode candidatar-se automaticamente
            em seu nome usando o currículo salvo no seu perfil.
          </p>
          <ul>
            <li><strong>O app não armazena senhas de LinkedIn, Indeed, Vagas.com ou qualquer outro site de vagas.</strong></li>
            <li>A candidatura automática acontece apenas em sistemas de seleção com API pública (Greenhouse, Lever) — projetados para receber candidaturas sem login.</li>
            <li>Seus dados (nome, e-mail, telefone, currículo) são enviados diretamente ao sistema da empresa candidatada, não a intermediários.</li>
            <li>Para sites que exigem login, o app abre a vaga e copia seus dados para você colar no formulário. Você faz a candidatura no seu próprio navegador, já logado.</li>
            <li>O consentimento é pedido antes de cada publicação em lote e fica registrado com data, hora e lista de vagas.</li>
            <li>Você pode apagar seu histórico de candidaturas a qualquer momento na página de perfil.</li>
          </ul>
          <div className="warning-box" style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.2)", color: "#6ee7b7" }}>
            <ShieldCheck size={18} />
            <span>O Minha Aptidão não é responsável por senhas ou contas de plataformas terceiras. A responsabilidade sobre suas contas externas é exclusivamente sua.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
