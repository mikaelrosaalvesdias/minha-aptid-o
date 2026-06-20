import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { ensureJobProfile, getResumeContext } from "@/lib/jobs/apply";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  phone: z.string().trim().max(40).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
  linkedin: z.string().trim().max(200).optional().nullable(),
  country: z.string().trim().max(120).optional().nullable(),
  countryCode: z.string().trim().max(4).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  workAuthorization: z.string().trim().max(200).optional().nullable(),
  needsVisaSponsorship: z.boolean().optional().nullable(),
  citizenshipStatus: z.string().trim().max(300).optional().nullable(),
  englishLevel: z.string().trim().max(80).optional().nullable(),
  currentSalary: z.string().trim().max(120).optional().nullable(),
  currentEmployer: z.string().trim().max(160).optional().nullable(),
  currentRole: z.string().trim().max(160).optional().nullable(),
  latestSchool: z.string().trim().max(160).optional().nullable(),
  latestDegree: z.string().trim().max(160).optional().nullable(),
  onsiteAvailability: z.string().trim().max(200).optional().nullable(),
  applicationSource: z.string().trim().max(120).optional().nullable(),
  pretensaoMin: z.number().min(0).optional().nullable(),
  pretensaoMax: z.number().min(0).optional().nullable(),
  summary: z.string().trim().max(2000).optional().nullable()
});

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const ctx = await getResumeContext();
    if (!ctx) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

    return NextResponse.json({
      hasResult: ctx.hasResult,
      resultId: ctx.resultId ?? null,
      topProfileNames: ctx.topProfileNames ?? [],
      strengths: ctx.strengths ?? [],
      keywords: ctx.keywords ?? [],
      jobProfile: ctx.jobProfile
    });
  } catch (error) {
    await logError("Falha ao carregar perfil de vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar o perfil." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const ensured = await ensureJobProfile();
    if (!ensured.ok) {
      return NextResponse.json({ error: ensured.reason }, { status: 400 });
    }

    const parsed = profileSchema.parse(await request.json());
    const jobProfile = await prisma.jobProfile.update({
      where: { userId },
      data: parsed
    });

    return NextResponse.json({ jobProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao salvar perfil de vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível salvar o perfil." }, { status: 500 });
  }
}
