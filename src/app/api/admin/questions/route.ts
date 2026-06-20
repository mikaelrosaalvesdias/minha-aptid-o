import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const schema = z.object({
  id: z.string().min(1),
  text: z.string().min(8),
  active: z.boolean(),
  order: z.number().int().min(1),
  weights: z.record(z.string(), z.number().int().min(0).max(5))
});

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    const profiles = await prisma.profile.findMany({ select: { id: true, slug: true } });

    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: payload.id },
        data: {
          text: payload.text,
          active: payload.active,
          order: payload.order
        }
      });

      for (const profile of profiles) {
        const weight = payload.weights[profile.slug] ?? 0;
        if (weight <= 0) {
          await tx.questionWeight.deleteMany({ where: { questionId: payload.id, profileId: profile.id } });
          continue;
        }

        await tx.questionWeight.upsert({
          where: {
            questionId_profileId: {
              questionId: payload.id,
              profileId: profile.id
            }
          },
          update: { weight },
          create: {
            questionId: payload.id,
            profileId: profile.id,
            weight
          }
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao atualizar pergunta", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar a pergunta." }, { status: 400 });
  }
}
