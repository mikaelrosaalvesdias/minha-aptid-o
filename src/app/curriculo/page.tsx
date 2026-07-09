import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { ResumeBuilderClient } from "@/components/ResumeBuilderClient";

export const dynamic = "force-dynamic";

export default async function CurriculoRedirectPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const latest = await prisma.result.findFirst({
    where: { session: { userId: user.id } },
    orderBy: { createdAt: "desc" },
    select: { id: true }
  });

  if (!latest) {
    return <ResumeBuilderClient userName={user.name} userEmail={user.email} strengths={[]} profiles={[]} />;
  }
  redirect(`/curriculo/${latest.id}`);
}
