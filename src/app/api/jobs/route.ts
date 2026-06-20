import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const cargo = searchParams.get("cargo")?.trim();
    const cidade = searchParams.get("cidade")?.trim();
    const modelo = searchParams.get("modelo")?.trim();
    const status = searchParams.get("status")?.trim();
    const minScore = searchParams.get("minScore");
    const minSalary = searchParams.get("minSalary");
    const maxSalary = searchParams.get("maxSalary");
    const onlySelected = searchParams.get("selected") === "1";

    const where: Record<string, unknown> = { userId };
    if (cargo) where.title = { contains: cargo, mode: "insensitive" };
    if (cidade) where.OR = [{ city: { contains: cidade, mode: "insensitive" } }, { state: { contains: cidade, mode: "insensitive" } }];
    if (modelo && modelo !== "qualquer") where.modelo = modelo;
    if (status) where.status = status;
    if (onlySelected) where.selected = true;
    if (minScore) where.compatibilityScore = { gte: parseInt(minScore, 10) };

    if (minSalary || maxSalary) {
      const sal: Record<string, number> = {};
      if (minSalary) sal.gte = parseFloat(minSalary);
      // salário é string; filtro aproximado não trivial — aplica em memória abaixo.
      void sal;
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: [{ compatibilityScore: "desc" }, { foundAt: "desc" }],
      take: 300
    });

    const filtered = jobs.filter((j) => {
      if (minSalary || maxSalary) {
        const num = parseSalary(j.salario);
        if (num == null) return true;
        if (minSalary && num < parseFloat(minSalary)) return false;
        if (maxSalary && num > parseFloat(maxSalary)) return false;
      }
      return true;
    });

    return NextResponse.json({ jobs: filtered });
  } catch (error) {
    await logError("Falha ao listar vagas", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível listar vagas." }, { status: 500 });
  }
}

function parseSalary(text?: string | null): number | null {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/\./g, "").replace(",", ".");
  const match = clean.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return clean.includes("mil") ? value * 1000 : value;
}
