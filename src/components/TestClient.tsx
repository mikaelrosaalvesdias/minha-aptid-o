"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Target, CheckCircle2 } from "lucide-react";

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

  if (loading) {
    return (
      <main className="ambient-shell">
        <div className="ambient-content page-shell" style={{ minHeight: "calc(100vh - 72px)", display: "grid", placeItems: "center" }}>
          <div className="proto-card" style={{ padding: 28, display: "inline-flex", gap: 12, alignItems: "center" }}><Loader2 className="spin" size={20} /><span>Carregando perguntas...</span></div>
        </div>
      </main>
    );
  }

  if (step === "intro") {
    return (
      <main className="ambient-shell">
        <div className="ambient-content proto-shell-md" style={{ display: "grid", gap: 32 }}>
          <Link href="/" className="proto-btn ghost" style={{ width: "max-content" }}><ArrowLeft size={18} /> Início</Link>
          <section style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 32, alignItems: "start" }}>
            <aside className="proto-card" style={{ padding: 26, position: "sticky", top: 95 }}>
              <p className="proto-eyebrow">Teste de aptidão</p>
              <h2 className="proto-title" style={{ fontSize: "1.5rem" }}>Sem pressa. <br />Responda com calma.</h2>
              <p className="proto-muted" style={{ fontSize: ".92rem", lineHeight: 1.6 }}>Não há respostas certas ou erradas. Escolha o que mais combina com você hoje.</p>
              <div style={{ display: "grid", gap: 9, marginTop: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".88rem", fontWeight: 600 }}><span style={{ color: "var(--muted)" }}>Progresso</span><span style={{ color: "var(--primary)" }}>{progress}%</span></div>
                <div style={{ height: 9, borderRadius: 999, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${progress}%`, borderRadius: 999, background: "linear-gradient(90deg,var(--primary),#5a93f7)", transition: "width .4s ease" }} /></div>
                <span style={{ color: "var(--faint)", fontSize: ".82rem" }}>{answeredCount} de {questions.length} respondidas</span>
              </div>
              <div style={{ display: "flex", gap: 9, alignItems: "center", padding: 13, borderRadius: 13, background: "var(--success-soft)", marginTop: 20 }}><CheckCircle2 size={18} color="var(--success)" /><span style={{ fontSize: ".84rem", color: "var(--muted)", lineHeight: 1.45 }}>Suas respostas ficam privadas.</span></div>
            </aside>

            <section className="proto-card" style={{ padding: "clamp(26px,4vw,44px)", display: "grid", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <span style={{ fontFamily: "var(--font-head)", fontSize: "2.6rem", fontWeight: 600, color: "var(--primary)", lineHeight: 1 }}>{current + 1}</span>
                <span style={{ color: "var(--faint)", fontWeight: 600 }}>/ {questions.length}</span>
                <span style={{ marginLeft: "auto", fontSize: ".78rem", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 700, color: "var(--primary)", background: "var(--primary-soft)", padding: "6px 13px", borderRadius: 999 }}>{question?.category}</span>
              </div>
              <h2 className="proto-title" style={{ fontSize: "clamp(1.6rem,3.2vw,2.3rem)", marginTop: 14 }}>{question?.text}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 30 }}>
                {scale.map((item) => {
                  const selected = selectedAnswer === item.v;
                  return (
                    <button key={item.v} type="button" onClick={() => selectAnswer(item.v)} style={{ display: "grid", gap: 10, justifyItems: "center", padding: "20px 10px", borderRadius: 14, cursor: "pointer", fontFamily: "var(--font-body)", textAlign: "center", background: selected ? "var(--primary-soft)" : "var(--surface)", border: selected ? "1.5px solid var(--primary)" : "1px solid var(--border)", transition: "var(--transition)" }}>
                      <span style={{ display: "inline-flex", width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 11, fontWeight: 700, fontSize: "1.05rem", background: selected ? "var(--primary)" : "var(--surface-2)", color: selected ? "#fff" : "var(--muted)" }}>{item.v}</span>
                      <span style={{ fontSize: ".82rem", lineHeight: 1.35, fontWeight: 600, color: selected ? "var(--text)" : "var(--muted)" }}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
              {error && <p className="form-error">{error}</p>}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 34, gap: 14 }}>
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
      <div className="ambient-content proto-shell-md" style={{ display: "grid", gap: 32 }}>
        <Link href="/" className="proto-btn ghost" style={{ width: "max-content" }}><ArrowLeft size={18} /> Início</Link>
        <section style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "clamp(30px,6vw,60px)", alignItems: "start" }}>
          <div>
            <p className="proto-eyebrow">Teste de aptidão</p>
            <h1 className="proto-title" style={{ fontSize: "clamp(2.6rem,5vw,4.2rem)" }}>Responda com calma. O resultado é um mapa inicial.</h1>
            <p className="proto-subtitle">Use a escala de 1 a 5 para indicar o quanto cada frase combina com você. Não existe resposta certa: o objetivo é sugerir caminhos para explorar na prática.</p>
            <div className="chip-list" style={{ marginTop: 32 }}>
              {categorySummary.map(([category, count]) => <span className="pill" key={category}>{category}: {count}</span>)}
            </div>
          </div>
          <div className="proto-card" style={{ padding: 28, display: "grid", gap: 20 }}>
            <div style={{ display: "inline-flex", width: 46, height: 46, alignItems: "center", justifyContent: "center", borderRadius: 13, background: "linear-gradient(140deg,var(--primary),#5a93f7)", boxShadow: "0 10px 22px -10px var(--primary-shadow)" }}><ShieldCheck size={24} color="#fff" /></div>
            <div>
              <h2 className="proto-title" style={{ fontSize: "1.35rem", margin: 0 }}>Consentimento</h2>
              <p className="proto-muted" style={{ margin: "4px 0 0", lineHeight: 1.6 }}>{initialUser ? "Seu resultado será salvo na sua conta." : "Crie uma conta para salvar seus resultados."}</p>
            </div>
            {initialUser ? (
              <div style={{ padding: 16, borderRadius: "var(--radius-md)", background: "var(--primary-soft)", border: "1px solid color-mix(in srgb,var(--primary) 22%,transparent)" }}>
                <p style={{ margin: 0, color: "var(--text)", fontWeight: 600 }}>Olá, {initialUser.name}!</p>
                <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: ".9rem" }}>Logado como {initialUser.email}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <Link href="/cadastro" className="button" style={{ width: "100%", textAlign: "center" }}>Criar conta grátis</Link>
                <Link href="/login" className="button secondary" style={{ width: "100%", textAlign: "center" }}>Já tenho conta — Entrar</Link>
                <p style={{ margin: 0, fontSize: ".85rem", color: "var(--muted)", textAlign: "center" }}>Sem conta seus resultados serão perdidos ao sair da página.</p>
              </div>
            )}
            <label className="consent-check">
              <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span>Aceito usar minhas respostas para gerar meu perfil e recomendações.</span>
            </label>
            {error && <p className="form-error">{error}</p>}
            <button className="button" type="button" disabled={!consent || questions.length === 0} onClick={() => setStep("questions")}>Começar teste <ArrowRight size={18} /></button>
          </div>
        </section>
      </div>
    </main>
  );
}
