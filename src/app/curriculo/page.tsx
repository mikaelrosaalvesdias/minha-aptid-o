import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CurriculoRedirectPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const latest = await prisma.result.findFirst({
    where: { session: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    select: { id: true }
  });

  if (!latest) redirect("/teste");
  redirect(`/curriculo/${latest.id}`);
}
