import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobPreferencesClient } from "@/components/JobPreferencesClient";

export const dynamic = "force-dynamic";

export default async function VagasPreferenciasPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const pref = await prisma.jobPreference.findUnique({ where: { userId: user.id } });

  return (
    <main className="page-shell vagas-shell">
      <div>
        <p className="eyebrow">Área de Vagas</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Preferências de busca</h1>
      </div>
      <JobPreferencesClient initial={pref} />
    </main>
  );
}
