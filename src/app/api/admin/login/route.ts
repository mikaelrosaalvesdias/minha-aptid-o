import { NextResponse } from "next/server";
import { z } from "zod";
import { adminIsConfigured, createAdminCookie, verifyAdminPassword } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const schema = z.object({
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    if (!adminIsConfigured()) {
      return NextResponse.json({ error: "ADMIN_PASSWORD não está configurado." }, { status: 503 });
    }

    const { password } = schema.parse(await request.json());
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Senha inválida." }, { status: 401 });
    }

    await createAdminCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha no login admin", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível entrar no admin." }, { status: 400 });
  }
}
