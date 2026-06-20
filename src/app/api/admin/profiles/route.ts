import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const schema = z.object({
  slug: z.string().min(1),
  description: z.string().min(20),
  strengths: z.array(z.string().min(1)),
  attentionPoints: z.array(z.string().min(1)),
  suggestedDegrees: z.array(z.string().min(1)),
  suggestedShortCourses: z.array(z.string().min(1)),
  searchKeywords: z.array(z.string().min(1))
});

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const payload = schema.parse(await request.json());
    await prisma.profile.update({
      where: { slug: payload.slug },
      data: {
        description: payload.description,
        strengths: payload.strengths,
        attentionPoints: payload.attentionPoints,
        suggestedDegrees: payload.suggestedDegrees,
        suggestedShortCourses: payload.suggestedShortCourses,
        searchKeywords: payload.searchKeywords
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao atualizar perfil", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível atualizar o perfil." }, { status: 400 });
  }
}
