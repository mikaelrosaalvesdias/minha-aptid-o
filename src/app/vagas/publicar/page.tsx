import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PublishQueueClient } from "@/components/PublishQueueClient";

export const dynamic = "force-dynamic";

export default async function VagasPublicarPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const jobProfile = await prisma.jobProfile.findUnique({ where: { userId: user.id } });

  return (
    <main className="page-shell vagas-shell">
      <div>
        <p className="eyebrow">Área de Vagas</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Fila de publicação</h1>
        <p className="muted" style={{ margin: "8px 0 0" }}>
          {jobProfile
            ? "Currículo em uso: seu último resultado de aptidão salvo + dados de candidatura."
            : "Você ainda não configurou seus dados de candidatura. O sistema usará seu resultado de aptidão."}
        </p>
      </div>
      <PublishQueueClient />
    </main>
  );
}
