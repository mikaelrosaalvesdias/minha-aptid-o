"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, RefreshCw, ShieldCheck } from "lucide-react";

type Step = "intro" | "questions";

export function TestClient({ initialUser }: { initialUser: any }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [questionError, setQuestionError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setQuestionError("");
    fetch("/api/questions")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.questions)) throw new Error("questions-error");
        if (!active) return;
        setQuestions(data.questions ?? []);
      })
      .catch(() => {
        if (!active) return;
        setQuestions([]);
        setQuestionError("Não conseguimos carregar as perguntas agora. Tente novamente em alguns instantes.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const question = questions[current];
  const canSubmit = questions.length > 0 && answeredCount >= questions.length && consent;

  const categorySummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of questions) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return Array.from(counts.entries());
  }, [questions]);

  function selectAnswer(value: number) {
    if (!question) return;
    setAnswers((previous) => ({ ...previous, [question.id]: value }));
  }

  function goNext() {
    if (current < questions.length - 1) setCurrent((value) => value + 1);
  }

  function goBack() {
    if (current > 0) setCurrent((value) => value - 1);
  }

  async function submit() {
    setError("");
    if (!canSubmit) {
      setError("Responda todas as perguntas e aceite o consentimento para gerar o resultado.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          consentAccepted: consent,
          answers: questions.map((item) => ({ questionId: item.id, value: answers[item.id] }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao gerar resultado.");
      router.push(`/resultado/${data.resultId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao gerar resultado.");
    } finally {
      setSubmitting(false);
    }
  }

  const scale = [
    { v: 1, label: "Discordo totalmente" },
    { v: 2, label: "Discordo" },
    { v: 3, label: "Neutro" },
    { v: 4, label: "Concordo" },
    { v: 5, label: "Concordo totalmente" }
  ];
  const selectedAnswer = question ? answers[question.id] ?? 0 : 0;

  function retryQuestions() {
    setCurrent(0);
    setAnswers({});
    setLoadAttempt((value) => value + 1);
  }

  if (loading) {
    return (
      <main className="ambient-shell">
        <div className="ambient-content test-page-shell test-loading-state">
          <div className="proto-card test-loading-card"><Loader2 className="spin" size={20} /><span>Carregando seu teste...</span></div>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="ambient-shell">
        <div className="ambient-content test-page-shell">
          <Link href="/" className="proto-btn ghost test-back-link"><ArrowLeft size={18} /> Início</Link>
          <section className="proto-card test-empty-state" role="alert">
            <span className="test-empty-icon"><AlertCircle size={28} /></span>
            <div>
              <p className="proto-eyebrow">Teste de aptidão</p>
              <h1 className="proto-title">Vamos preparar seu mapa.</h1>
              <p className="proto-subtitle">{questionError || "As perguntas ainda não estão disponíveis. Tente carregar novamente."}</p>
            </div>
            <div className="test-empty-actions">
              <button className="proto-btn primary" type="button" onClick={retryQuestions}><RefreshCw size={18} /> Tentar novamente</button>
              <Link href="/" className="proto-btn">Voltar ao início</Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main className="ambient-shell">
        <div className="ambient-content test-page-shell">
          <Link href="/" className="proto-btn ghost test-back-link"><ArrowLeft size={18} /> Início</Link>
          <section className="test-question-layout">
            <aside className="proto-card test-progress-card">
              <div>
                <p className="proto-eyebrow">Teste de aptidão</p>
                <h2 className="proto-title">Sem pressa. <br />Responda com calma.</h2>
                <p className="proto-muted test-progress-copy">Não há respostas certas ou erradas. Escolha o que mais combina com você hoje.</p>
              </div>
              <div className="test-progress-wrap">
                <div className="test-progress-meta"><span>Progresso</span><strong>{progress}%</strong></div>
                <div className="test-progress-track"><div className="test-progress-fill" style={{ width: `${progress}%` }} /></div>
                <span className="test-progress-count">{answeredCount} de {questions.length} respondidas</span>
              </div>
              <div className="test-privacy-note"><CheckCircle2 size={18} /><span>Suas respostas ficam privadas.</span></div>
            </aside>

            <section className="proto-card test-question-card">
              <div className="test-question-meta">
                <div className="test-question-number"><strong>{current + 1}</strong><span>/ {questions.length}</span></div>
                <span className="test-category">{question.category}</span>
              </div>
              <div className="test-question-heading">
                <p className="test-question-hint">Escolha uma opção</p>
                <h2 className="proto-title">{question.text}</h2>
              </div>
              <div className="test-scale-grid" role="radiogroup" aria-label={question.text}>
                {scale.map((item) => {
                  const selected = selectedAnswer === item.v;
                  return (
                    <button key={item.v} type="button" className={`test-scale-option${selected ? " selected" : ""}`} onClick={() => selectAnswer(item.v)} aria-pressed={selected}>
                      <span className="test-scale-value">{item.v}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {error && <p className="form-error">{error}</p>}
              <div className="test-question-actions">
                <button className="proto-btn" type="button" onClick={goBack} disabled={current === 0}><ArrowLeft size={17} /> Anterior</button>
                {current < questions.length - 1 ? (
                  <button className="proto-btn primary" type="button" onClick={goNext} disabled={!question || !answers[question.id]}>Próxima <ArrowRight size={17} /></button>
                ) : (
                  <button className="proto-btn primary" type="button" onClick={submit} disabled={!canSubmit || submitting}>{submitting ? <Loader2 className="spin" size={18} /> : <Check size={18} />} Ver meu resultado</button>
                )}
              </div>
            </section>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="ambient-shell">
      <div className="ambient-content test-page-shell">
        <Link href="/" className="proto-btn ghost test-back-link"><ArrowLeft size={18} /> Início</Link>
        <section className="test-intro-layout">
          <div className="test-intro-copy">
            <p className="proto-eyebrow">Teste de aptidão</p>
            <h1 className="proto-title">Responda com calma. O resultado é um mapa inicial.</h1>
            <p className="proto-subtitle">Use a escala de 1 a 5 para indicar o quanto cada frase combina com você. Não existe resposta certa: o objetivo é sugerir caminhos para explorar na prática.</p>
            <div className="chip-list test-category-list">
              {categorySummary.map(([category, count]) => <span className="pill" key={category}>{category}: {count}</span>)}
            </div>
          </div>
          <div className="proto-card test-consent-card">
            <div className="test-consent-icon"><ShieldCheck size={24} /></div>
            <div>
              <h2 className="proto-title test-consent-title">Consentimento</h2>
              <p className="proto-muted test-consent-copy">{initialUser ? "Seu resultado será salvo na sua conta." : "Crie uma conta para salvar seus resultados."}</p>
            </div>
            {initialUser ? (
              <div className="test-user-note">
                <p style={{ margin: 0, color: "var(--text)", fontWeight: 600 }}>Olá, {initialUser.name}!</p>
                <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>Logado como {initialUser.email}</p>
              </div>
            ) : (
              <div className="test-auth-actions">
                <Link href="/cadastro" className="button" style={{ width: "100%", textAlign: "center" }}>Criar conta grátis</Link>
                <Link href="/login" className="button secondary" style={{ width: "100%", textAlign: "center" }}>Já tenho conta — Entrar</Link>
                <p className="test-auth-note">Sem conta seus resultados serão perdidos ao sair da página.</p>
              </div>
            )}
            <label className="consent-check">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Aceito usar minhas respostas para gerar meu perfil e recomendações.</span>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="button test-start-button" type="button" disabled={!consent || questions.length === 0} onClick={() => setStep("questions")}>Começar teste <ArrowRight size={18} /></button>
          </div>
        </section>
      </div>
    </main>
  );
}
