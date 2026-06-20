CREATE TABLE "UserSession" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "consentAccepted" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Question" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'scale',
  "options" JSONB,
  "tags" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "strengths" JSONB NOT NULL,
  "attentionPoints" JSONB NOT NULL,
  "suggestedDegrees" JSONB NOT NULL,
  "suggestedShortCourses" JSONB NOT NULL,
  "searchKeywords" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "QuestionWeight" (
  "id" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "weight" INTEGER NOT NULL,
  CONSTRAINT "QuestionWeight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Answer" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Result" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "scores" JSONB NOT NULL,
  "topProfiles" JSONB NOT NULL,
  "capacityScores" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CourseRecommendation" (
  "id" TEXT NOT NULL,
  "profileSlug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "isFree" BOOLEAN NOT NULL DEFAULT true,
  "source" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CourseRecommendation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CapacityTest" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "relatedProfiles" JSONB NOT NULL,
  "studyTips" JSONB NOT NULL,
  "order" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CapacityTest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CapacityQuestion" (
  "id" TEXT NOT NULL,
  "testId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "options" JSONB NOT NULL,
  "correctAnswer" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  CONSTRAINT "CapacityQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AppLog" (
  "id" TEXT NOT NULL,
  "level" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "meta" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AppLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Question_slug_key" ON "Question"("slug");
CREATE UNIQUE INDEX "Profile_slug_key" ON "Profile"("slug");
CREATE UNIQUE INDEX "QuestionWeight_questionId_profileId_key" ON "QuestionWeight"("questionId", "profileId");
CREATE UNIQUE INDEX "Answer_sessionId_questionId_key" ON "Answer"("sessionId", "questionId");
CREATE UNIQUE INDEX "Result_sessionId_key" ON "Result"("sessionId");
CREATE UNIQUE INDEX "CapacityTest_slug_key" ON "CapacityTest"("slug");

ALTER TABLE "QuestionWeight" ADD CONSTRAINT "QuestionWeight_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuestionWeight" ADD CONSTRAINT "QuestionWeight_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Result" ADD CONSTRAINT "Result_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "UserSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CourseRecommendation" ADD CONSTRAINT "CourseRecommendation_profileSlug_fkey" FOREIGN KEY ("profileSlug") REFERENCES "Profile"("slug") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CapacityQuestion" ADD CONSTRAINT "CapacityQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "CapacityTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
