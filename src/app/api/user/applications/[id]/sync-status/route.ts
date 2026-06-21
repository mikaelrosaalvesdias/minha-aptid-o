import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { logError } from "@/lib/logging";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const schema = z.object({
  applicationStatus: z.enum(["draft", "pending_user_approval", "approved", "submitting", "submitted", "failed", "cancelled", "interview", "rejected", "hired", "unknown"]).optional(),
  metadata: z.record(z.unknown()).optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  try {
    const { id } = await params;
    const payload = schema.parse(await request.json());
    const application = await prisma.externalJobApplication.updateMany({
      where: { id, userId: user.id },
      data: {
        applicationStatus: payload.applicationStatus,
        metadataJson: payload.metadata as Prisma.InputJsonValue,
        lastStatusSyncAt: new Date()
      }
    });
    if (application.count === 0) return NextResponse.json({ error: "Candidatura não encontrada." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao atualizar status de candidatura externa", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar candidatura." }, { status: 400 });
  }
}
