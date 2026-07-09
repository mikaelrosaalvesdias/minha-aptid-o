import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const progressSchema = z.object({
  courseId: z.string().min(1),
  progress: z.number().int().min(0).max(100).default(1),
  completed: z.boolean().default(false)
});

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login para salvar seu progresso." }, { status: 401 });

  try {
    const progress = await prisma.userCourseProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        courseId: true,
        progress: true,
        completed: true,
        lastAccessedAt: true,
        completedAt: true,
        updatedAt: true
      }
    });
    return NextResponse.json({ progress });
  } catch (error) {
    await logError("Falha ao carregar progresso dos cursos", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar seu progresso." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login para salvar seu progresso." }, { status: 401 });

  try {
    const payload = progressSchema.parse(await request.json());
    const course = await prisma.courseRecommendation.findFirst({
      where: { id: payload.courseId, active: true },
      select: { id: true }
    });

    if (!course) return NextResponse.json({ error: "Curso não encontrado." }, { status: 404 });

    const completed = payload.completed || payload.progress >= 100;
    const progress = await prisma.userCourseProgress.upsert({
      where: { userId_courseId: { userId, courseId: payload.courseId } },
      create: {
        userId,
        courseId: payload.courseId,
        progress: payload.progress,
        completed,
        lastAccessedAt: new Date(),
        completedAt: completed ? new Date() : null
      },
      update: {
        progress: payload.progress,
        completed,
        lastAccessedAt: new Date(),
        completedAt: completed ? new Date() : null
      },
      select: {
        courseId: true,
        progress: true,
        completed: true,
        lastAccessedAt: true,
        completedAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    await logError("Falha ao salvar progresso do curso", { error: String(error) });
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Dados inválidos para salvar o progresso." }, { status: 400 });
    return NextResponse.json({ error: "Não foi possível salvar seu progresso." }, { status: 500 });
  }
}
