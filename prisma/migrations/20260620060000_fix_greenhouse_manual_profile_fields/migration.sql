ALTER TABLE "JobProfile" ADD COLUMN "country" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "location" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "workAuthorization" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "needsVisaSponsorship" BOOLEAN;
ALTER TABLE "JobProfile" ADD COLUMN "citizenshipStatus" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "englishLevel" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "currentSalary" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "currentEmployer" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "currentRole" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "latestSchool" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "latestDegree" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "onsiteAvailability" TEXT;
ALTER TABLE "JobProfile" ADD COLUMN "applicationSource" TEXT;

UPDATE "Job"
SET "sourceAutoSupport" = 'requires_employer_auth'
WHERE "source" = 'greenhouse';

UPDATE "JobApplication"
SET "status" = 'acao_manual',
    "sourceCompat" = 'requires_employer_auth',
    "errorMessage" = 'Greenhouse ATS: o envio automático exige chave privada da empresa. Abra a vaga, copie o pacote de candidatura e preencha os campos obrigatórios.'
WHERE "status" = 'falhou'
  AND "errorMessage" ILIKE 'Greenhouse 401:%';
