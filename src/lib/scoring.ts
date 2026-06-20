import type { Profile, Question, QuestionWeight } from "@prisma/client";
import type { SubmittedAnswer, TopProfileResult } from "./types";

type QuestionWithWeights = Question & {
  weights: (QuestionWeight & { profile: Profile })[];
};

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export function calculateProfileResult(questions: QuestionWithWeights[], answers: SubmittedAnswer[]) {
  const answerMap = new Map(answers.map((answer) => [answer.questionId, answer.value]));
  const rawScores = new Map<string, number>();
  const maxScores = new Map<string, number>();
  const profiles = new Map<string, Profile>();
  const highTags = new Map<string, number>();
  const lowTags = new Map<string, number>();

  for (const question of questions) {
    const value = answerMap.get(question.id);
    if (!value) continue;

    const tags = asStringArray(question.tags);
    if (value >= 4) {
      for (const tag of tags) highTags.set(tag, (highTags.get(tag) ?? 0) + 1);
    }
    if (value <= 2) {
      for (const tag of tags) lowTags.set(tag, (lowTags.get(tag) ?? 0) + 1);
    }

    for (const weight of question.weights) {
      profiles.set(weight.profile.slug, weight.profile);
      rawScores.set(weight.profile.slug, (rawScores.get(weight.profile.slug) ?? 0) + weight.weight * value);
      maxScores.set(weight.profile.slug, (maxScores.get(weight.profile.slug) ?? 0) + weight.weight * 5);
    }
  }

  const topProfiles: TopProfileResult[] = Array.from(profiles.values())
    .map((profile) => {
      const rawScore = rawScores.get(profile.slug) ?? 0;
      const maxScore = maxScores.get(profile.slug) || 1;
      const percentage = Math.max(0, Math.min(100, Math.round((rawScore / maxScore) * 100)));

      return {
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        description: profile.description,
        percentage,
        rawScore,
        strengths: asStringArray(profile.strengths),
        attentionPoints: asStringArray(profile.attentionPoints),
        suggestedDegrees: asStringArray(profile.suggestedDegrees),
        suggestedShortCourses: asStringArray(profile.suggestedShortCourses),
        searchKeywords: asStringArray(profile.searchKeywords)
      };
    })
    .sort((a, b) => b.percentage - a.percentage || b.rawScore - a.rawScore)
    .slice(0, 3);

  const scores = Object.fromEntries(
    Array.from(profiles.values()).map((profile) => {
      const rawScore = rawScores.get(profile.slug) ?? 0;
      const maxScore = maxScores.get(profile.slug) || 1;
      return [profile.slug, Math.max(0, Math.min(100, Math.round((rawScore / maxScore) * 100)))];
    })
  );

  const strongestTags = Array.from(highTags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  const attentionTags = Array.from(lowTags.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);

  return {
    scores,
    topProfiles,
    detectedStrengths: strongestTags,
    detectedAttentionPoints: attentionTags
  };
}

export function buildHumanSummary(topProfiles: TopProfileResult[]) {
  const [first, second, third] = topProfiles;
  if (!first) {
    return "Seu resultado ainda não tem dados suficientes. Responda ao teste com calma para receber uma orientação mais útil.";
  }

  const others = [second?.name, third?.name].filter(Boolean).join(" e ");
  return `Seu resultado indica maior afinidade com ${first.name}${others ? `, com aproximação também de ${others}` : ""}. Isso não é um diagnóstico definitivo: é um mapa inicial para explorar caminhos com base nas suas respostas, testar cursos curtos e observar o que faz sentido na prática.`;
}

export function capacityLevel(percentage: number) {
  if (percentage >= 75) return "forte";
  if (percentage >= 45) return "intermediário";
  return "iniciante";
}
