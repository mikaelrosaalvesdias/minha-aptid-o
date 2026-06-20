import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { recommendResumeTemplates } from "@/lib/resume/recommend";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  targetArea: z.string().max(120).optional().nullable(),
  targetRole: z.string().max(120).optional().nullable(),
  useForAutoApply: z.boolean().default(false),
  manualApply: z.boolean().default(false),
  hasAtsJob: z.boolean().default(false),
  wantsPhoto: z.boolean().default(false)
});

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const parsed = requestSchema.parse(await request.json());
    const resume = await prisma.resume.findUnique({ where: { userId } });
    if (!resume) return NextResponse.json({ error: "Salve o currículo antes de pedir recomendação." }, { status: 400 });
    const recommendations = recommendResumeTemplates({
      resume: {
        id: resume.id,
        title: resume.title,
        phone: resume.phone,
        linkedin: resume.linkedin,
        summary: resume.summary,
        photo: resume.photo,
        experiences: resume.experiences as Array<{ company: string; role: string; period: string; description: string }>,
        education: resume.education as Array<{ institution: string; course: string; period: string }>,
        topProfileNames: asArray(resume.topProfileNames),
        strengths: asArray(resume.strengths),
        uploadedText: resume.uploadedText,
        activeResumeType: resume.activeResumeType
      },
      ...parsed
    });
    return NextResponse.json({ recommendations });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao recomendar template de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível recomendar templates." }, { status: 500 });
  }
}
