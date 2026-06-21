-- CreateTable
CREATE TABLE "IntegrationProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'job_distribution',
    "authType" TEXT NOT NULL DEFAULT 'not_available',
    "status" TEXT NOT NULL DEFAULT 'pending_credentials',
    "baseUrl" TEXT,
    "clientIdEncrypted" TEXT,
    "clientSecretEncrypted" TEXT,
    "apiKeyEncrypted" TEXT,
    "webhookSecretEncrypted" TEXT,
    "scopesJson" JSONB NOT NULL DEFAULT '[]',
    "capabilitiesJson" JSONB NOT NULL DEFAULT '[]',
    "settingsJson" JSONB NOT NULL DEFAULT '{}',
    "isVisibleToUsers" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "dailyLimit" INTEGER NOT NULL DEFAULT 0,
    "monthlyLimit" INTEGER NOT NULL DEFAULT 0,
    "lastHealthcheckAt" TIMESTAMP(3),
    "lastHealthcheckStatus" TEXT,
    "lastError" TEXT,
    "activeAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserExternalConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerSlug" TEXT NOT NULL,
    "externalAccountId" TEXT,
    "externalAccountName" TEXT,
    "externalEmail" TEXT,
    "connectionStatus" TEXT NOT NULL DEFAULT 'pending',
    "authType" TEXT NOT NULL DEFAULT 'not_available',
    "accessTokenEncrypted" TEXT,
    "refreshTokenEncrypted" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "composioEntityId" TEXT,
    "composioConnectionId" TEXT,
    "scopesJson" JSONB NOT NULL DEFAULT '[]',
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserExternalConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalJob" (
    "id" TEXT NOT NULL,
    "providerId" TEXT,
    "providerSlug" TEXT NOT NULL,
    "externalJobId" TEXT,
    "title" TEXT NOT NULL,
    "companyName" TEXT,
    "location" TEXT,
    "remoteType" TEXT,
    "contractType" TEXT,
    "salaryMin" DOUBLE PRECISION,
    "salaryMax" DOUBLE PRECISION,
    "description" TEXT,
    "requirementsJson" JSONB NOT NULL DEFAULT '[]',
    "benefitsJson" JSONB NOT NULL DEFAULT '[]',
    "applicationUrl" TEXT,
    "sourceUrl" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "matchScore" INTEGER NOT NULL DEFAULT 0,
    "matchReason" TEXT,
    "missingSkillsJson" JSONB NOT NULL DEFAULT '[]',
    "recommendedCoursesJson" JSONB NOT NULL DEFAULT '[]',
    "recommendedResumeVersionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalJobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "externalJobId" TEXT NOT NULL,
    "providerId" TEXT,
    "providerSlug" TEXT NOT NULL,
    "resumeVersionId" TEXT,
    "applicationStatus" TEXT NOT NULL DEFAULT 'pending_user_approval',
    "applicationMode" TEXT NOT NULL DEFAULT 'manual_assisted',
    "externalApplicationId" TEXT,
    "consentAccepted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),
    "lastStatusSyncAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalJobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "providerId" TEXT,
    "providerSlug" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "requestSummaryJson" JSONB NOT NULL DEFAULT '{}',
    "responseSummaryJson" JSONB NOT NULL DEFAULT '{}',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationRateLimit" (
    "id" TEXT NOT NULL,
    "providerSlug" TEXT NOT NULL,
    "usedToday" INTEGER NOT NULL DEFAULT 0,
    "usedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "resetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "monthResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "providerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationRateLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationProvider_slug_key" ON "IntegrationProvider"("slug");

-- CreateIndex
CREATE INDEX "IntegrationProvider_status_idx" ON "IntegrationProvider"("status");

-- CreateIndex
CREATE INDEX "IntegrationProvider_isVisibleToUsers_idx" ON "IntegrationProvider"("isVisibleToUsers");

-- CreateIndex
CREATE UNIQUE INDEX "UserExternalConnection_userId_providerId_key" ON "UserExternalConnection"("userId", "providerId");

-- CreateIndex
CREATE INDEX "UserExternalConnection_userId_connectionStatus_idx" ON "UserExternalConnection"("userId", "connectionStatus");

-- CreateIndex
CREATE INDEX "UserExternalConnection_providerSlug_idx" ON "UserExternalConnection"("providerSlug");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalJob_providerSlug_externalJobId_key" ON "ExternalJob"("providerSlug", "externalJobId");

-- CreateIndex
CREATE INDEX "ExternalJob_providerSlug_idx" ON "ExternalJob"("providerSlug");

-- CreateIndex
CREATE INDEX "ExternalJob_title_idx" ON "ExternalJob"("title");

-- CreateIndex
CREATE UNIQUE INDEX "JobMatch_userId_externalJobId_key" ON "JobMatch"("userId", "externalJobId");

-- CreateIndex
CREATE INDEX "JobMatch_userId_status_idx" ON "JobMatch"("userId", "status");

-- CreateIndex
CREATE INDEX "JobMatch_matchScore_idx" ON "JobMatch"("matchScore");

-- CreateIndex
CREATE INDEX "ExternalJobApplication_userId_applicationStatus_idx" ON "ExternalJobApplication"("userId", "applicationStatus");

-- CreateIndex
CREATE INDEX "ExternalJobApplication_providerSlug_idx" ON "ExternalJobApplication"("providerSlug");

-- CreateIndex
CREATE INDEX "IntegrationLog_providerSlug_createdAt_idx" ON "IntegrationLog"("providerSlug", "createdAt");

-- CreateIndex
CREATE INDEX "IntegrationLog_status_idx" ON "IntegrationLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationRateLimit_providerId_key" ON "IntegrationRateLimit"("providerId");

-- AddForeignKey
ALTER TABLE "UserExternalConnection" ADD CONSTRAINT "UserExternalConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserExternalConnection" ADD CONSTRAINT "UserExternalConnection_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalJob" ADD CONSTRAINT "ExternalJob_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_externalJobId_fkey" FOREIGN KEY ("externalJobId") REFERENCES "ExternalJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobMatch" ADD CONSTRAINT "JobMatch_recommendedResumeVersionId_fkey" FOREIGN KEY ("recommendedResumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalJobApplication" ADD CONSTRAINT "ExternalJobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalJobApplication" ADD CONSTRAINT "ExternalJobApplication_externalJobId_fkey" FOREIGN KEY ("externalJobId") REFERENCES "ExternalJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalJobApplication" ADD CONSTRAINT "ExternalJobApplication_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalJobApplication" ADD CONSTRAINT "ExternalJobApplication_resumeVersionId_fkey" FOREIGN KEY ("resumeVersionId") REFERENCES "ResumeVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationRateLimit" ADD CONSTRAINT "IntegrationRateLimit_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "IntegrationProvider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "driveFileId" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "driveFileUrl" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "driveExportUrl" TEXT;
ALTER TABLE "ResumeVersion" ADD COLUMN IF NOT EXISTS "targetExternalJobId" TEXT;

-- AddForeignKey
ALTER TABLE "ResumeVersion" ADD CONSTRAINT "ResumeVersion_targetExternalJobId_fkey" FOREIGN KEY ("targetExternalJobId") REFERENCES "ExternalJob"("id") ON DELETE SET NULL ON UPDATE CASCADE;
