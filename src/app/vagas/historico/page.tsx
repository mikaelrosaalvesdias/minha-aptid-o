import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobHistoryClient } from "@/components/JobHistoryClient";
import { JobProfileClient } from "@/components/JobProfileClient";
import { getResumeContext } from "@/lib/jobs/apply";

export const dynamic = "force-dynamic";

export default async function VagasHistoricoPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const ctx = await getResumeContext();

  const initialProfile = ctx
    ? {
        hasResult: ctx.hasResult,
        resultId: ctx.resultId ?? null,
        topProfileNames: ctx.hasResult ? ctx.topProfileNames : [],
        strengths: ctx.hasResult ? ctx.strengths : [],
        keywords: ctx.hasResult ? ctx.keywords : [],
        jobProfile: ctx.jobProfile
      }
    : null;

  return (
    <main className="page-shell vagas-shell">
      <div>
        <p className="eyebrow">Área de Vagas</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Histórico e currículo</h1>
      </div>

      <JobProfileClient initial={initialProfile} />

      <div>
        <h2 style={{ margin: "0 0 16px" }}>Histórico de buscas</h2>
        <JobHistoryClient />
      </div>
    </main>
  );
}
