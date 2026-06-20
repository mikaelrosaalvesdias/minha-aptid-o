import type { ProfileSlug } from "@/data/profiles";

export type PublicQuestion = {
  id: string;
  text: string;
  category: string;
  type: string;
  options: unknown;
  order: number;
};

export type SubmittedAnswer = {
  questionId: string;
  value: number;
};

export type ScoreMap = Record<ProfileSlug | string, number>;

export type TopProfileResult = {
  id: string;
  slug: string;
  name: string;
  description: string;
  percentage: number;
  rawScore: number;
  strengths: string[];
  attentionPoints: string[];
  suggestedDegrees: string[];
  suggestedShortCourses: string[];
  searchKeywords: string[];
};

export type CapacityScore = {
  testSlug: string;
  title: string;
  score: number;
  total: number;
  percentage: number;
  level: "iniciante" | "intermediário" | "forte";
  studyTips: string[];
  relatedProfiles: string[];
};
