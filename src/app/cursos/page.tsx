import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { CursosClient } from "@/components/CursosClient";

export const dynamic = "force-dynamic";

function asTopProfiles(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { name: string } => Boolean(item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string"))
    .map((item) => (item as { name: string }).name);
}

export default async function CursosPage() {
  const user = await getUser();
  const latest = user
    ? await prisma.result.findFirst({
        where: { session: { userId: user.id } },
        orderBy: { createdAt: "desc" },
        select: { id: true, topProfiles: true }
      })
    : null;

  const courses = await prisma.courseRecommendation.findMany({
    where: { active: true, ...(latest ? { profileSlug: { in: asTopProfiles(latest.topProfiles).slice(0, 3) } } : {}) },
    orderBy: [{ profileSlug: "asc" }, { order: "asc" }],
    take: 12
  });

  return <CursosClient initialCourses={courses} profileNames={latest ? asTopProfiles(latest.topProfiles).slice(0, 3) : []} />;
}
