export type GreenhouseField = {
  name: string;
  type: string;
  values?: { label: string; value: string | number }[];
};

export type GreenhouseQuestion = {
  group: string;
  label: string;
  required: boolean;
  fields: GreenhouseField[];
};

export async function getGreenhouseJobQuestions(board: string, jobId: string): Promise<GreenhouseQuestion[]> {
  try {
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}?questions=true`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 30 }
    });
    if (!res.ok) return [];
    const data = await res.json() as {
      location_questions?: Array<{ label?: string; required?: boolean; fields?: GreenhouseField[] }>;
      questions?: Array<{ label?: string; required?: boolean; fields?: GreenhouseField[] }>;
      compliance?: Array<{ label?: string; required?: boolean; fields?: GreenhouseField[] }>;
    };
    const groups = [
      ["location_questions", data.location_questions ?? []],
      ["questions", data.questions ?? []],
      ["compliance", data.compliance ?? []]
    ] as const;
    return groups.flatMap(([group, questions]) => questions.map((question) => ({
      group,
      label: question.label ?? "Campo obrigatório",
      required: Boolean(question.required),
      fields: question.fields ?? []
    })));
  } catch {
    return [];
  }
}

export function summarizeRequiredGreenhouseQuestions(questions: GreenhouseQuestion[]) {
  const required = questions.filter((question) => question.required);
  const labels = required
    .map((question) => question.label.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 8);
  return {
    requiredCount: required.length,
    labels,
    message: required.length > 0
      ? `Esta vaga pede ${required.length} campo(s) obrigatório(s): ${labels.join("; ")}${required.length > labels.length ? "; ..." : ""}`
      : "Esta vaga não retornou perguntas obrigatórias, mas o Greenhouse ainda exige chave privada da empresa para envio automático."
  };
}
