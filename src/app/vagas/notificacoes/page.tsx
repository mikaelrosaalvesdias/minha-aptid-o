import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { JobNotificationsClient } from "@/components/JobNotificationsClient";

export const dynamic = "force-dynamic";

export default async function VagasNotificacoesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const unread = await prisma.jobNotification.count({ where: { userId: user.id, read: false } });

  return (
    <main className="page-shell vagas-shell">
      <div>
        <p className="eyebrow">Área de Vagas</p>
        <h1 style={{ margin: 0, fontSize: "clamp(2rem, 5vw, 3rem)" }}>Notificações {unread > 0 && <span className="pill" style={{ marginLeft: 12 }}>{unread} nova(s)</span>}</h1>
      </div>
      <JobNotificationsClient />
    </main>
  );
}
