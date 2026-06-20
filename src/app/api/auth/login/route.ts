import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";
import crypto from "crypto";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, 'hex');
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password } = loginSchema.parse(data);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 400 });
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 400 });
    }

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao fazer login." }, { status: 500 });
  }
}
