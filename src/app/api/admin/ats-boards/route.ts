import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const boards = await prisma.aTSBoard.findMany({ orderBy: [{ source: "asc" }, { label: "asc" }] });
    return NextResponse.json({ boards });
  } catch (error) {
    await logError("Falha ao listar boards ATS", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível listar boards." }, { status: 500 });
  }
}

const createSchema = z.object({
  source: z.enum(["greenhouse", "lever"]),
  boardKey: z.string().trim().min(1).max(80),
  label: z.string().trim().min(2).max(80),
  active: z.boolean().default(true)
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const payload = createSchema.parse(await request.json());
    const board = await prisma.aTSBoard.create({ data: payload });
    return NextResponse.json({ board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao criar board ATS", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível criar o board." }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const schema = createSchema.extend({ id: z.string().min(1) });
    const payload = schema.parse(await request.json());
    const { id, ...data } = payload;
    const board = await prisma.aTSBoard.update({ where: { id }, data });
    return NextResponse.json({ board });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos.", issues: error.issues }, { status: 400 });
    }
    await logError("Falha ao atualizar board ATS", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar o board." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID obrigatório." }, { status: 400 });
    await prisma.aTSBoard.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao remover board ATS", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível remover o board." }, { status: 400 });
  }
}
