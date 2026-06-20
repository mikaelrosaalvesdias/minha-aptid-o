import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const notifications = await prisma.jobNotification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    const unread = notifications.filter((n) => !n.read).length;
    return NextResponse.json({ notifications, unread });
  } catch (error) {
    await logError("Falha ao carregar notificações de vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar notificações." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const body = (await request.json()) as { id?: string; all?: boolean };
    if (body.all) {
      await prisma.jobNotification.updateMany({ where: { userId, read: false }, data: { read: true } });
      return NextResponse.json({ ok: true });
    }
    if (body.id) {
      await prisma.jobNotification.update({ where: { id: body.id }, data: { read: true } });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Informe id ou all." }, { status: 400 });
  } catch (error) {
    await logError("Falha ao marcar notificações", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar notificações." }, { status: 500 });
  }
}
