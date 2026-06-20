-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resultId" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Profissional',
    "phone" TEXT,
    "linkedin" TEXT,
    "summary" TEXT,
    "photo" TEXT,
    "experiences" JSONB NOT NULL DEFAULT '[]',
    "education" JSONB NOT NULL DEFAULT '[]',
    "topProfileNames" JSONB NOT NULL DEFAULT '[]',
    "strengths" JSONB NOT NULL DEFAULT '[]',
    "uploadedFileName" TEXT,
    "uploadedFileData" BYTEA,
    "uploadedFileType" TEXT,
    "uploadedFileSize" INTEGER,
    "uploadedText" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "activeResumeType" TEXT NOT NULL DEFAULT 'builder',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ATSBoard" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "boardKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ATSBoard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resume_userId_key" ON "Resume"("userId");
CREATE UNIQUE INDEX "ATSBoard_source_boardKey_key" ON "ATSBoard"("source", "boardKey");

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
