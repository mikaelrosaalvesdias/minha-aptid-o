import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VagasClient } from "@/components/VagasClient";

export const dynamic = "force-dynamic";

export default async function VagasPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const pref = await prisma.jobPreference.findUnique({ where: { userId: user.id } });
  const jobs = await prisma.job.findMany({
    where: { userId: user.id },
    orderBy: [{ compatibilityScore: "desc" }, { foundAt: "desc" }],
    take: 100
  });

  return (
    <main className="page-shell vagas-shell">
      {!pref && (
        <div className="warning-box" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <strong>Configure suas preferências primeiro.</strong>
            <p style={{ margin: "4px 0 0" }}>Defina cargo, área, cidade e palavras-chave para buscarmos vagas compatíveis com você.</p>
          </div>
          <a href="/vagas/preferencias" className="button" style={{ flexShrink: 0 }}>Configurar</a>
        </div>
      )}
      <VagasClient initialJobs={jobs} />
    </main>
  );
}
