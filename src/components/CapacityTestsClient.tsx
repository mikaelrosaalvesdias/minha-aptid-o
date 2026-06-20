"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import type { CapacityScore } from "@/lib/types";

type Option = {
  key: string;
  label: string;
};

type CapacityQuestion = {
  id: string;
  text: string;
  options: Option[];
  explanation: string;
};

type CapacityTest = {
  slug: string;
  title: string;
  description: string;
  relatedProfiles: string[];
  studyTips: string[];
  questions: CapacityQuestion[];
};

export function CapacityTestsClient({
  resultId,
  recommendedProfileSlugs,
  existingScores
}: {
  resultId: string;
  recommendedProfileSlugs: string[];
  existingScores: CapacityScore[];
}) {
  const [tests, setTests] = useState<CapacityTest[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<CapacityScore[]>(existingScores);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/capacity-tests")
      .then((response) => response.json())
      .then((data) => setTests(data.tests ?? []))
      .finally(() => setLoading(false));
  }, []);

  const orderedTests = useMemo(() => {
    return [...tests].sort((a, b) => {
      const aRecommended = a.relatedProfiles.some((slug) => recommendedProfileSlugs.includes(slug)) ? 0 : 1;
      const bRecommended = b.relatedProfiles.some((slug) => recommendedProfileSlugs.includes(slug)) ? 0 : 1;
      return aRecommended - bRecommended;
    });
  }, [recommendedProfileSlugs, tests]);

  const selected = tests.find((test) => test.slug === selectedSlug);
  const complete = selected ? selected.questions.every((question) => answers[question.id]) : false;

  async function finishTest() {
    if (!selected || !complete) return;
    setSubmitting(true);
    const response = await fetch(`/api/results/${resultId}/capacity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testSlug: selected.slug, answers })
    });
    const data = await response.json();
    if (response.ok) {
      setScores((previous) => [...previous.filter((item) => item.testSlug !== selected.slug), data.score]);
      setSelectedSlug("");
      setAnswers({});
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="inline-loading">
        <Loader2 className="spin" size={18} /> Carregando testes práticos...
      </div>
    );
  }

  return (
    <div className="capacity-area">
      <div className="capacity-grid">
        {orderedTests.map((test) => {
          const score = scores.find((item) => item.testSlug === test.slug);
          return (
            <button className="capacity-card card" type="button" key={test.slug} onClick={() => setSelectedSlug(test.slug)}>
              <ClipboardCheck size={22} />
              <span>{test.title}</span>
              <small>{score ? `${score.score}/${score.total} · ${score.level}` : test.description}</small>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="capacity-modal" role="dialog" aria-modal="true" aria-label={selected.title}>
          <div className="capacity-dialog card">
            <div className="dialog-title">
              <div>
                <p className="eyebrow">Teste prático</p>
                <h3>{selected.title}</h3>
              </div>
              <button className="button ghost" type="button" onClick={() => setSelectedSlug("")}>
                Fechar
              </button>
            </div>
            <div className="capacity-questions">
              {selected.questions.map((question, index) => (
                <fieldset className="capacity-question" key={question.id}>
                  <legend>
                    {index + 1}. {question.text}
                  </legend>
                  <div className="capacity-options">
                    {question.options.map((option) => (
                      <label key={option.key}>
                        <input
                          type="radio"
                          name={question.id}
                          checked={answers[question.id] === option.key}
                          onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: option.key }))}
                        />
                        <span>
                          <strong>{option.key}</strong> {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <button className="button" type="button" disabled={!complete || submitting} onClick={finishTest}>
              {submitting ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
              Ver pontuação
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
