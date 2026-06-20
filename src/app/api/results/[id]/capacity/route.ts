import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { capacityLevel } from "@/lib/scoring";
import { logError } from "@/lib/logging";
import type { CapacityScore } from "@/lib/types";

export const dynamic = "force-dynamic";

const payloadSchema = z.object({
  testSlug: z.string().min(1),
  answers: z.record(z.string(), z.string())
});

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const payload = payloadSchema.parse(await request.json());
    const test = await prisma.capacityTest.findUnique({
      where: { slug: payload.testSlug },
      include: { questions: { orderBy: { order: "asc" } } }
    });

    if (!test) {
      return NextResponse.json({ error: "Teste prático não encontrado." }, { status: 404 });
    }

    const total = test.questions.length;
    const score = test.questions.reduce((sum, question) => {
      return sum + (payload.answers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
    const percentage = total ? Math.round((score / total) * 100) : 0;

    const capacityScore: CapacityScore = {
      testSlug: test.slug,
      title: test.title,
      score,
      total,
      percentage,
      level: capacityLevel(percentage),
      studyTips: stringArray(test.studyTips),
      relatedProfiles: stringArray(test.relatedProfiles)
    };

    const result = await prisma.result.findUnique({ where: { id } });
    if (!result) {
      return NextResponse.json({ error: "Resultado não encontrado." }, { status: 404 });
    }

    const previous = Array.isArray(result.capacityScores) ? (result.capacityScores as CapacityScore[]) : [];
    const nextScores = [...previous.filter((item) => item.testSlug !== test.slug), capacityScore];

    await prisma.result.update({
      where: { id },
      data: { capacityScores: nextScores }
    });

    return NextResponse.json({ score: capacityScore });
  } catch (error) {
    await logError("Falha ao salvar teste prático", { resultId: id, error: String(error) });
    return NextResponse.json({ error: "Não foi possível salvar o teste prático." }, { status: 500 });
  }
}
