import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const upsertSchema = z.object({
  id: z.string().optional(),
  profileSlug: z.string().min(1),
  title: z.string().min(2),
  provider: z.string().min(2),
  url: z.string().url(),
  type: z.string().min(2),
  isFree: z.boolean().default(true),
  source: z.string().min(2).default("admin"),
  active: z.boolean().default(true),
  order: z.number().int().min(0).default(0)
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const payload = upsertSchema.parse(await request.json());
    const course = await prisma.courseRecommendation.create({ data: payload });
    return NextResponse.json({ course });
  } catch (error) {
    await logError("Falha ao criar curso", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível criar o curso." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const payload = upsertSchema.extend({ id: z.string().min(1) }).parse(await request.json());
    const { id, ...data } = payload;
    const course = await prisma.courseRecommendation.update({ where: { id }, data });
    return NextResponse.json({ course });
  } catch (error) {
    await logError("Falha ao atualizar curso", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar o curso." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    }
    await prisma.courseRecommendation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao remover curso", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível remover o curso." }, { status: 400 });
  }
}
