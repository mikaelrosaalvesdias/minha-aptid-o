import { PrismaClient } from "@prisma/client";
import { profiles, courseRecommendations } from "../src/data/profiles";
import { integrationProviders } from "../src/data/integrations";
import { aptitudeQuestions } from "../src/data/questions";
import { capacityTests } from "../src/data/capacity-tests";

const prisma = new PrismaClient();

async function main() {
  const profileIdBySlug = new Map<string, string>();

  for (const profile of profiles) {
    const saved = await prisma.profile.upsert({
      where: { slug: profile.slug },
      update: {},
      create: {
        name: profile.name,
        slug: profile.slug,
        description: profile.description,
        strengths: profile.strengths,
        attentionPoints: profile.attentionPoints,
        suggestedDegrees: profile.suggestedDegrees,
        suggestedShortCourses: profile.suggestedShortCourses,
        searchKeywords: profile.searchKeywords
      }
    });
    profileIdBySlug.set(profile.slug, saved.id);
  }

  for (const provider of integrationProviders) {
    await prisma.integrationProvider.upsert({
      where: { slug: provider.slug },
      update: {
        name: provider.name,
        type: provider.type,
        authType: provider.authType,
        status: provider.status,
        capabilitiesJson: provider.capabilities,
        scopesJson: provider.scopes,
        environment: provider.environment,
        isVisibleToUsers: provider.isVisibleToUsers,
        notes: provider.notes
      },
      create: {
        name: provider.name,
        slug: provider.slug,
        type: provider.type,
        authType: provider.authType,
        status: provider.status,
        capabilitiesJson: provider.capabilities,
        scopesJson: provider.scopes,
        environment: provider.environment,
        isVisibleToUsers: provider.isVisibleToUsers,
        notes: provider.notes
      }
    });
  }

  for (const question of aptitudeQuestions) {
    const savedQuestion = await prisma.question.upsert({
      where: { slug: question.slug },
      update: {},
      create: {
        slug: question.slug,
        text: question.text,
        category: question.category,
        type: question.type,
        tags: question.tags,
        active: true,
        order: question.order
      }
    });

    for (const [profileSlug, weight] of Object.entries(question.weights)) {
      const profileId = profileIdBySlug.get(profileSlug);
      if (!profileId || !weight) continue;

      await prisma.questionWeight.upsert({
        where: {
          questionId_profileId: {
            questionId: savedQuestion.id,
            profileId
          }
        },
        update: {},
        create: {
          questionId: savedQuestion.id,
          profileId,
          weight
        }
      });
    }
  }

  for (const course of courseRecommendations) {
    const existing = await prisma.courseRecommendation.findFirst({
      where: {
        profileSlug: course.profileSlug,
        title: course.title,
        provider: course.provider
      }
    });

    if (!existing) {
      await prisma.courseRecommendation.create({
        data: {
          profileSlug: course.profileSlug,
          title: course.title,
          provider: course.provider,
          url: course.url,
          type: course.type,
          isFree: true,
          source: course.source,
          order: course.order,
          active: true
        }
      });
    }
  }

  for (const test of capacityTests) {
    const savedTest = await prisma.capacityTest.upsert({
      where: { slug: test.slug },
      update: {},
      create: {
        slug: test.slug,
        title: test.title,
        description: test.description,
        relatedProfiles: test.relatedProfiles,
        studyTips: test.studyTips,
        order: test.order,
        active: true
      }
    });

    const count = await prisma.capacityQuestion.count({ where: { testId: savedTest.id } });
    if (count === 0) {
      await prisma.capacityQuestion.createMany({
        data: test.questions.map((question) => ({
          testId: savedTest.id,
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          order: question.order
        }))
      });
    }
  }

  await prisma.appLog.create({
    data: {
      level: "info",
      message: "Seed executado",
      meta: {
        profiles: profiles.length,
        questions: aptitudeQuestions.length,
        capacityTests: capacityTests.length
      }
    }
  });

  // Seed boards ATS (v1.3.0)
  const atsBoards = [
    { source: "greenhouse", boardKey: "notion", label: "Notion" },
    { source: "greenhouse", boardKey: "airtable", label: "Airtable" },
    { source: "greenhouse", boardKey: "stripe", label: "Stripe" },
    { source: "greenhouse", boardKey: "flexport", label: "Flexport" },
    { source: "greenhouse", boardKey: "datadog", label: "Datadog" },
    { source: "greenhouse", boardKey: "figma", label: "Figma" },
    { source: "greenhouse", boardKey: "mercury", label: "Mercury" },
    { source: "greenhouse", boardKey: "loom", label: "Loom" },
    { source: "greenhouse", boardKey: "vercel", label: "Vercel" },
    { source: "greenhouse", boardKey: "linear", label: "Linear" },
    { source: "greenhouse", boardKey: "monzo", label: "Monzo" },
    { source: "greenhouse", boardKey: "revolut", label: "Revolut" },
    { source: "greenhouse", boardKey: "nubank", label: "Nubank" },
    { source: "greenhouse", boardKey: "canva", label: "Canva" },
    { source: "greenhouse", boardKey: "deepl", label: "DeepL" },
    { source: "lever", boardKey: "veeva", label: "Veeva" },
    { source: "lever", boardKey: "segment", label: "Segment" },
    { source: "lever", boardKey: "cruise", label: "Cruise" },
    { source: "lever", boardKey: "khanacademy", label: "Khan Academy" },
    { source: "lever", boardKey: "gitlab", label: "GitLab" },
    { source: "lever", boardKey: "launchdarkly", label: "LaunchDarkly" },
    { source: "lever", boardKey: "robinhood", label: "Robinhood" },
    { source: "lever", boardKey: "scale", label: "Scale" }
  ];

  for (const board of atsBoards) {
    await prisma.aTSBoard.upsert({
      where: { source_boardKey: { source: board.source, boardKey: board.boardKey } },
      update: { label: board.label },
      create: board
    });
  }
}

main()
  .catch(async (error) => {
    console.error(error);
    await prisma.appLog.create({
      data: {
        level: "error",
        message: "Falha ao executar seed",
        meta: { error: String(error) }
      }
    }).catch(() => undefined);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
