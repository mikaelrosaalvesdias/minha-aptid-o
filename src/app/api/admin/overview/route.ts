import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

function list(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const [sessionCount, resultCount, results, questions, profiles, courses, integrationProviders, logs, answerAverages] = await Promise.all([
      prisma.userSession.count(),
      prisma.result.count(),
      prisma.result.findMany({ select: { topProfiles: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.question.findMany({
        orderBy: { order: "asc" },
        include: {
          weights: {
            include: { profile: { select: { slug: true, name: true } } },
            orderBy: { weight: "desc" }
          }
        }
      }),
      prisma.profile.findMany({ orderBy: { name: "asc" } }),
      prisma.courseRecommendation.findMany({ orderBy: [{ profileSlug: "asc" }, { order: "asc" }] }),
      prisma.integrationProvider.findMany({ orderBy: { name: "asc" } }),
      prisma.appLog.findMany({ orderBy: { createdAt: "desc" }, take: 30 }),
      prisma.answer.groupBy({
        by: ["questionId"],
        _avg: { value: true },
        _count: { value: true }
      })
    ]);

    const profileCounts = new Map<string, number>();
    for (const result of results) {
      const top = Array.isArray(result.topProfiles) ? result.topProfiles[0] : null;
      const slug = typeof top === "object" && top && "slug" in top ? String(top.slug) : null;
      if (slug) profileCounts.set(slug, (profileCounts.get(slug) ?? 0) + 1);
    }

    const profileNameBySlug = new Map(profiles.map((profile) => [profile.slug, profile.name]));
    const commonProfiles = Array.from(profileCounts.entries())
      .map(([slug, count]) => ({ slug, name: profileNameBySlug.get(slug) ?? slug, count }))
      .sort((a, b) => b.count - a.count);

    const avgByQuestion = new Map(answerAverages.map((item) => [item.questionId, item]));

    return NextResponse.json({
      stats: {
        sessionCount,
        resultCount,
        commonProfiles
      },
      questions: questions.map((question) => ({
        id: question.id,
        slug: question.slug,
        text: question.text,
        category: question.category,
        active: question.active,
        order: question.order,
        tags: list(question.tags),
        average: avgByQuestion.get(question.id)?._avg.value ?? null,
        answers: avgByQuestion.get(question.id)?._count.value ?? 0,
        weights: profiles.map((profile) => {
          const existing = question.weights.find((weight) => weight.profile.slug === profile.slug);
          return {
            id: existing?.id ?? `${question.id}-${profile.slug}`,
            profileSlug: profile.slug,
            profileName: profile.name,
            weight: existing?.weight ?? 0
          };
        })
      })),
      profiles: profiles.map((profile) => ({
        id: profile.id,
        slug: profile.slug,
        name: profile.name,
        description: profile.description,
        strengths: list(profile.strengths),
        attentionPoints: list(profile.attentionPoints),
        suggestedDegrees: list(profile.suggestedDegrees),
        suggestedShortCourses: list(profile.suggestedShortCourses),
        searchKeywords: list(profile.searchKeywords)
      })),
      courses,
      integrationProviders: integrationProviders.map((provider) => ({
        id: provider.id,
        name: provider.name,
        slug: provider.slug,
        type: provider.type,
        authType: provider.authType,
        status: provider.status,
        baseUrl: provider.baseUrl,
        capabilities: Array.isArray(provider.capabilitiesJson) ? provider.capabilitiesJson.filter((item) => typeof item === "string") : [],
        scopes: Array.isArray(provider.scopesJson) ? provider.scopesJson.filter((item) => typeof item === "string") : [],
        isVisibleToUsers: provider.isVisibleToUsers,
        environment: provider.environment,
        dailyLimit: provider.dailyLimit,
        monthlyLimit: provider.monthlyLimit,
        lastHealthcheckAt: provider.lastHealthcheckAt?.toISOString() ?? null,
        lastHealthcheckStatus: provider.lastHealthcheckStatus,
        lastError: provider.lastError,
        activeAt: provider.activeAt?.toISOString() ?? null,
        notes: provider.notes
      })),
      logs
    });
  } catch (error) {
    await logError("Falha ao carregar overview admin", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar o admin." }, { status: 500 });
  }
}
