import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const resumeSchema = z.object({
  title: z.string().trim().max(120).default("Profissional"),
  phone: z.string().trim().max(40).optional().nullable(),
  linkedin: z.string().trim().max(200).optional().nullable(),
  summary: z.string().trim().max(3000).optional().nullable(),
  photo: z.string().optional().nullable(),
  experiences: z.array(z.object({
    company: z.string().max(120),
    role: z.string().max(120),
    period: z.string().max(80),
    description: z.string().max(1000)
  })).max(20),
  education: z.array(z.object({
    institution: z.string().max(120),
    course: z.string().max(120),
    period: z.string().max(80)
  })).max(20),
  topProfileNames: z.array(z.string().max(120)).max(10).default([]),
  strengths: z.array(z.string().max(120)).max(30).default([]),
  activeResumeType: z.enum(["builder", "uploaded"]).default("builder")
});

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const resume = await prisma.resume.findUnique({ where: { userId } });
    return NextResponse.json({ resume });
  } catch (error) {
    await logError("Falha ao carregar currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar o currículo." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const parsed = resumeSchema.parse(await request.json());

    const resume = await prisma.resume.upsert({
      where: { userId },
      create: { userId, ...parsed },
      update: parsed
    });

    return NextResponse.json({ resume });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao salvar currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível salvar o currículo." }, { status: 500 });
  }
}
