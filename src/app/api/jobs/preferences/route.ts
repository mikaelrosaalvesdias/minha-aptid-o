import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import type { JobPreferenceInput } from "@/lib/jobs/types";

export const dynamic = "force-dynamic";

const prefSchema = z.object({
  cargo: z.string().trim().max(120).optional().nullable(),
  area: z.string().trim().max(120).optional().nullable(),
  cidade: z.string().trim().max(120).optional().nullable(),
  estado: z.string().trim().max(80).optional().nullable(),
  modelo: z.enum(["presencial", "hibrido", "remoto", "qualquer"]),
  salarioMin: z.number().min(0).optional().nullable(),
  salarioMax: z.number().min(0).optional().nullable(),
  nivel: z.enum(["estagio", "junior", "pleno", "senior", "lideranca", "qualquer"]),
  contrato: z.enum(["clt", "pj", "estagio", "freelancer", "temporario", "qualquer"]),
  keywordsDesejadas: z.array(z.string().trim().max(80)).max(20),
  keywordsEvitar: z.array(z.string().trim().max(80)).max(20),
  aceitaSemSalario: z.boolean(),
  aceitaForaCidade: z.boolean(),
  frequenciaBusca: z.enum(["manual", "diaria", "semanal"]),
  recebeNotificacoes: z.boolean()
});

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const pref = await prisma.jobPreference.findUnique({ where: { userId } });
    return NextResponse.json({ preference: pref });
  } catch (error) {
    await logError("Falha ao carregar preferências de vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar preferências." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const parsed = prefSchema.parse(await request.json());
    const data = {
      ...parsed,
      keywordsDesejadas: parsed.keywordsDesejadas,
      keywordsEvitar: parsed.keywordsEvitar
    } as Partial<JobPreferenceInput>;

    const pref = await prisma.jobPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data
    });

    return NextResponse.json({ preference: pref });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao salvar preferências de vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível salvar preferências." }, { status: 500 });
  }
}
