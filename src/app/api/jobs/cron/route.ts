import { NextResponse } from "next/server";
import { logError } from "@/lib/logging";
import { runCronSearch } from "@/lib/jobs/cron";

export const dynamic = "force-dynamic";

// Rota chamada por cron externo (crontab, n8n, GitHub Actions).
// Protegida por header x-cron-secret validado contra CRON_SECRET no .env.
// Sem auth de usuário — é executada por scheduler externo.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não configurado no servidor." }, { status: 500 });
  }

  const headerSecret = request.headers.get("x-cron-secret");
  if (headerSecret !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const result = await runCronSearch();
    return NextResponse.json(result);
  } catch (error) {
    await logError("Falha no cron de vagas", { error: String(error) });
    return NextResponse.json({ error: "Falha no cron." }, { status: 500 });
  }
}
