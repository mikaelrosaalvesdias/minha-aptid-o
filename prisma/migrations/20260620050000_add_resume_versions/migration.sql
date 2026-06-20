CREATE TABLE "ResumeVersion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resumeId" TEXT,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'visual',
    "templateId" TEXT NOT NULL,
    "targetArea" TEXT,
    "targetRole" TEXT,
    "visualConfig" JSONB NOT NULL DEFAULT '{}',
    "sectionConfig" JSONB NOT NULL DEFAULT '{}',
    "guideAnswers" JSONB NOT NULL DEFAULT '{}',
    "scores" JSONB NOT NULL DEFAULT '{}',
    "suggestions" JSONB NOT NULL DEFAULT '[]',
    "exportHistory" JSONB NOT NULL DEFAULT '[]',
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "useForAutoApply" BOOLEAN NOT NULL DEFAULT false,
    "useForManualApply" BOOLEAN NOT NULL DEFAULT false,
    "useForAreas" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResumeVersion_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ResumeVersion_userId_idx" ON "ResumeVersion"("userId");
CREATE INDEX "ResumeVersion_userId_isPrincipal_idx" ON "ResumeVersion"("userId", "isPrincipal");
CREATE INDEX "ResumeVersion_userId_useForAutoApply_idx" ON "ResumeVersion"("userId", "useForAutoApply");

ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;
