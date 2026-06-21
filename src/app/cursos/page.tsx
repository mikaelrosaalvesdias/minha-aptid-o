import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import { CursosClient } from "@/components/CursosClient";

export const dynamic = "force-dynamic";

const legacyProfileSlugMap: Record<string, string> = {
  dados: "dados-analise",
  design: "design-criatividade",
  gestao: "administrativo-financeiro"
};

function normalizeProfileSlug(slug: string) {
  return legacyProfileSlugMap[slug] ?? slug;
}

function asTopProfiles(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { name: string } => Boolean(item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string"))
    .map((item) => (item as { name: string }).name);
}

function asTopProfileSlugs(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { slug: string } => Boolean(item && typeof item === "object" && typeof (item as { slug?: unknown }).slug === "string"))
    .map((item) => normalizeProfileSlug((item as { slug: string }).slug));
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

  const topProfiles = latest ? asTopProfiles(latest.topProfiles).slice(0, 3) : [];
  const topProfileSlugs = latest ? asTopProfileSlugs(latest.topProfiles).slice(0, 3) : [];

  const courses = await prisma.courseRecommendation.findMany({
    where: { active: true, ...(topProfileSlugs.length > 0 ? { profileSlug: { in: topProfileSlugs } } : {}) },
    orderBy: [{ profileSlug: "asc" }, { order: "asc" }],
    take: 12
  });

  const visibleCourses = courses.length > 0 ? courses : await prisma.courseRecommendation.findMany({
    where: { active: true },
    orderBy: [{ profileSlug: "asc" }, { order: "asc" }],
    take: 12
  });

  return <CursosClient initialCourses={visibleCourses} profileNames={topProfiles} />;
}
