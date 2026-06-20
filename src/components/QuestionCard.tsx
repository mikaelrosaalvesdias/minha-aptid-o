"use client";

import clsx from "clsx";
import type { PublicQuestion } from "@/lib/types";

const scale = [
  { value: 1, label: "Nada a ver comigo" },
  { value: 2, label: "Pouco a ver comigo" },
  { value: 3, label: "Neutro" },
  { value: 4, label: "Tem a ver comigo" },
  { value: 5, label: "Muito a ver comigo" }
];

export function QuestionCard({
  question,
  value,
  onChange
}: {
  question: PublicQuestion;
  value?: number;
  onChange: (value: number) => void;
}) {
  return (
    <article className="question-card card">
      <p className="question-category">{question.category}</p>
      <h2>{question.text}</h2>
      <div className="scale-grid" role="radiogroup" aria-label={question.text}>
        {scale.map((item) => (
          <button
            key={item.value}
            type="button"
            className={clsx("scale-option", value === item.value && "selected")}
            aria-pressed={value === item.value}
            onClick={() => onChange(item.value)}
          >
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </article>
  );
}
