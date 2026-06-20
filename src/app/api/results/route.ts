import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateProfileResult } from "@/lib/scoring";
import { logError } from "@/lib/logging";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.number().int().min(1).max(5)
});

const resultSchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal("")),
  email: z.string().trim().email().optional().or(z.literal("")),
  consentAccepted: z.literal(true),
  answers: z.array(answerSchema).min(40)
});

export async function POST(request: Request) {
  try {
    const payload = resultSchema.parse(await request.json());
    const questionIds = payload.answers.map((answer) => answer.questionId);
    
    const userId = await getSession();

    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds }, active: true },
      include: {
        weights: {
          include: {
            profile: true
          }
        }
      }
    });

    if (questions.length < 40) {
      return NextResponse.json({ error: "Responda pelo menos 40 perguntas para gerar o resultado." }, { status: 400 });
    }

    const calculated = calculateProfileResult(questions, payload.answers);

    const result = await prisma.$transaction(async (tx) => {
      const session = await tx.userSession.create({
        data: {
          userId: userId || null,
          name: payload.name || null,
          email: payload.email || null,
          consentAccepted: payload.consentAccepted
        }
      });

      await tx.answer.createMany({
        data: payload.answers.map((answer) => ({
          sessionId: session.id,
          questionId: answer.questionId,
          value: answer.value
        }))
      });

      return tx.result.create({
        data: {
          sessionId: session.id,
          scores: {
            profiles: calculated.scores,
            detectedStrengths: calculated.detectedStrengths,
            detectedAttentionPoints: calculated.detectedAttentionPoints
          },
          topProfiles: calculated.topProfiles,
          capacityScores: []
        }
      });
    });

    return NextResponse.json({ resultId: result.id });
  } catch (error) {
    await logError("Falha ao gerar resultado", { error: String(error) });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos para gerar o resultado." }, { status: 400 });
    }
    return NextResponse.json({ error: "Não foi possível gerar o resultado." }, { status: 500 });
  }
}
