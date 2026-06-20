-- CreateTable
CREATE TABLE "JobPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cargo" TEXT,
    "area" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "modelo" TEXT NOT NULL DEFAULT 'qualquer',
    "salarioMin" DOUBLE PRECISION,
    "salarioMax" DOUBLE PRECISION,
    "nivel" TEXT NOT NULL DEFAULT 'qualquer',
    "contrato" TEXT NOT NULL DEFAULT 'qualquer',
    "keywordsDesejadas" JSONB NOT NULL DEFAULT '[]',
    "keywordsEvitar" JSONB NOT NULL DEFAULT '[]',
    "aceitaSemSalario" BOOLEAN NOT NULL DEFAULT true,
    "aceitaForaCidade" BOOLEAN NOT NULL DEFAULT true,
    "frequenciaBusca" TEXT NOT NULL DEFAULT 'manual',
    "recebeNotificacoes" BOOLEAN NOT NULL DEFAULT true,
    "ultimaBuscaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resultId" TEXT,
    "topProfileNames" JSONB NOT NULL DEFAULT '[]',
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "summary" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "linkedin" TEXT,
    "pretensaoMin" DOUBLE PRECISION,
    "pretensaoMax" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT,
    "city" TEXT,
    "state" TEXT,
    "modelo" TEXT,
    "salario" TEXT,
    "contrato" TEXT,
    "nivel" TEXT,
    "description" TEXT,
    "requisitos" JSONB,
    "beneficios" JSONB,
    "originalUrl" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceAutoSupport" TEXT NOT NULL DEFAULT 'link_only',
    "publishedAt" TIMESTAMP(3),
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'nova',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "dedupHash" TEXT NOT NULL,
    "compatibilityScore" INTEGER NOT NULL DEFAULT 0,
    "compatibilityReason" TEXT,
    "compatibilityBlock" TEXT,
    "viewed" BOOLEAN NOT NULL DEFAULT false,
    "selected" BOOLEAN NOT NULL DEFAULT false,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "preferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "areaCargo" TEXT,
    "jobCount" INTEGER NOT NULL DEFAULT 0,
    "searchDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "jobIds" JSONB NOT NULL DEFAULT '[]',
    "preferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobConsent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jobCount" INTEGER NOT NULL,
    "resumeUsed" TEXT,
    "status" TEXT NOT NULL DEFAULT 'confirmado',
    "jobIds" JSONB NOT NULL DEFAULT '[]',
    "jobProfileId" TEXT,
    "preferenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "consentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aguardando',
    "attemptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "resumeSnapshot" JSONB,
    "sourceCompat" TEXT,
    "jobProfileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSearchHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "query" TEXT,
    "filters" JSONB,
    "foundCount" INTEGER NOT NULL DEFAULT 0,
    "newCount" INTEGER NOT NULL DEFAULT 0,
    "preferenceId" TEXT,

    CONSTRAINT "JobSearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobPreference_userId_key" ON "JobPreference"("userId");
CREATE UNIQUE INDEX "JobProfile_userId_key" ON "JobProfile"("userId");
CREATE UNIQUE INDEX "Job_userId_dedupHash_key" ON "Job"("userId", "dedupHash");
CREATE INDEX "Job_userId_status_idx" ON "Job"("userId", "status");
CREATE INDEX "Job_userId_compatibilityScore_idx" ON "Job"("userId", "compatibilityScore");
CREATE INDEX "JobNotification_userId_read_idx" ON "JobNotification"("userId", "read");
CREATE UNIQUE INDEX "JobApplication_userId_jobId_key" ON "JobApplication"("userId", "jobId");
CREATE INDEX "JobApplication_userId_status_idx" ON "JobApplication"("userId", "status");
CREATE INDEX "JobSearchHistory_userId_searchedAt_idx" ON "JobSearchHistory"("userId", "searchedAt");

-- AddForeignKey
ALTER TABLE "JobPreference" ADD CONSTRAINT "JobPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobProfile" ADD CONSTRAINT "JobProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "JobPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobNotification" ADD CONSTRAINT "JobNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobNotification" ADD CONSTRAINT "JobNotification_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "JobPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobConsent" ADD CONSTRAINT "JobConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobConsent" ADD CONSTRAINT "JobConsent_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobConsent" ADD CONSTRAINT "JobConsent_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "JobPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_consentId_fkey" FOREIGN KEY ("consentId") REFERENCES "JobConsent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JobSearchHistory" ADD CONSTRAINT "JobSearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobSearchHistory" ADD CONSTRAINT "JobSearchHistory_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "JobPreference"("id") ON DELETE SET NULL ON UPDATE CASCADE;
