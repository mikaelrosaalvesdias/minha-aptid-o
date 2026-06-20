"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { QuestionCard } from "./QuestionCard";
import type { PublicQuestion } from "@/lib/types";

type Step = "intro" | "questions";

export function TestClient({ initialUser }: { initialUser: any }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [name, setName] = useState(initialUser?.name || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/questions")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        setQuestions(data.questions ?? []);
      })
      .catch(() => setError("Não foi possível carregar o teste."))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round((answeredCount / questions.length) * 100) : 0;
  const question = questions[current];
  const canSubmit = answeredCount >= questions.length && consent;

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
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
    }
  }

  function goBack() {
    if (current > 0) {
      setCurrent((value) => value - 1);
    }
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

  if (loading) {
    return (
      <main className="test-shell page-shell">
        <div className="loading-state card">
          <Loader2 className="spin" size={24} />
          <span>Carregando perguntas...</span>
        </div>
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main className="test-shell page-shell">
        <section className="test-intro">
          <Link href="/" className="button ghost">
            <ArrowLeft size={18} /> Início
          </Link>
          <div className="test-intro-grid">
            <div>
              <p className="eyebrow">Teste de aptidão</p>
              <h1>Responda com calma. O resultado é um mapa inicial.</h1>
              <p>
                Use a escala de 1 a 5 para indicar o quanto cada frase combina com você. Não existe resposta certa:
                o objetivo é sugerir caminhos para explorar na prática.
              </p>
              <div className="category-list">
                {categorySummary.map(([category, count]) => (
                  <span className="pill" key={category}>
                    {category}: {count}
                  </span>
                ))}
              </div>
            </div>
            <div className="consent-card card">
              <ShieldCheck size={26} />
              <h2>Consentimento</h2>
              <p>
                As respostas serão usadas para gerar seu resultado. 
                {initialUser ? " Seu resultado será salvo na sua conta." : " Crie uma conta para salvar seus resultados."}
              </p>
              
              {initialUser ? (
                <div style={{ padding: "16px", borderRadius: "var(--radius-md)", background: "rgba(139, 92, 246, 0.1)", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                  <p style={{ margin: 0, color: "var(--text-main)", fontWeight: 600 }}>
                    👋 Olá, {initialUser.name}!
                  </p>
                  <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    Logado como {initialUser.email}
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  <Link href="/cadastro" className="button" style={{ width: "100%", textAlign: "center" }}>
                    Criar conta grátis
                  </Link>
                  <Link href="/login" className="button secondary" style={{ width: "100%", textAlign: "center" }}>
                    Já tenho conta — Entrar
                  </Link>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center" }}>
                    Sem conta seus resultados serão perdidos ao sair da página.
                  </p>
                </div>
              )}

              <label className="consent-check">
                <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                <span>Aceito usar minhas respostas para gerar meu perfil e recomendações.</span>
              </label>
              {error && <p className="form-error">{error}</p>}
              <button className="button" type="button" disabled={!consent || questions.length === 0} onClick={() => setStep("questions")}>
                Começar teste <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="test-shell page-shell">
      <div className="question-layout">
        <aside className="test-sidebar card">
          <ProgressBar value={progress} label="Teste principal" />
          <div className="question-counter">
            <strong>
              {current + 1}/{questions.length}
            </strong>
            <span>{question?.category}</span>
          </div>
          <p>1 = nada a ver comigo. 5 = muito a ver comigo.</p>
        </aside>
        <section>
          {question && <QuestionCard question={question} value={answers[question.id]} onChange={selectAnswer} />}
          {error && <p className="form-error">{error}</p>}
          <div className="question-actions">
            <button className="button secondary" type="button" onClick={goBack} disabled={current === 0}>
              <ArrowLeft size={18} /> Voltar
            </button>
            {current < questions.length - 1 ? (
              <button className="button" type="button" onClick={goNext} disabled={!question || !answers[question.id]}>
                Próxima <ArrowRight size={18} />
              </button>
            ) : (
              <button className="button" type="button" onClick={submit} disabled={!canSubmit || submitting}>
                {submitting ? <Loader2 className="spin" size={18} /> : <Check size={18} />}
                Gerar resultado
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
