import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { resumeToPlainText } from "@/lib/resume/export";

export const dynamic = "force-dynamic";

// Retorna os dados do currículo do usuário formatados para copiar/colar
// em formulários externos. Sem credenciais de terceiros — só dados do próprio usuário.
export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const jobProfile = await prisma.jobProfile.findUnique({ where: { userId } });
    const resume = await prisma.resume.findUnique({ where: { userId } });
    const principalVersion = await prisma.resumeVersion.findFirst({
      where: { userId, OR: [{ isPrincipal: true }, { useForManualApply: true }, { useForAutoApply: true }] },
      orderBy: [{ isPrincipal: "desc" }, { useForManualApply: "desc" }, { useForAutoApply: "desc" }, { updatedAt: "desc" }]
    });

    if (resume && principalVersion) {
      let text = resumeToPlainText({
        userName: user.name,
        userEmail: user.email,
        resume: {
          id: resume.id,
          title: resume.title,
          phone: resume.phone,
          linkedin: resume.linkedin,
          summary: resume.summary,
          photo: resume.photo,
          experiences: resume.experiences as Array<{ company: string; role: string; period: string; description: string }>,
          education: resume.education as Array<{ institution: string; course: string; period: string }>,
          topProfileNames: (resume.topProfileNames as string[]) ?? [],
          strengths: (resume.strengths as string[]) ?? [],
          uploadedText: resume.uploadedText,
          activeResumeType: resume.activeResumeType
        },
        sectionConfig: principalVersion.sectionConfig as never,
        ats: principalVersion.useForAutoApply
      });
      const applicationLines: string[] = [];
      if (jobProfile?.location) applicationLines.push(`Localização completa: ${jobProfile.location}`);
      if (jobProfile?.country) applicationLines.push(`País: ${jobProfile.country}`);
      if (jobProfile?.countryCode) applicationLines.push(`Código do país: ${jobProfile.countryCode}`);
      if (jobProfile?.workAuthorization) applicationLines.push(`Autorização de trabalho: ${jobProfile.workAuthorization}`);
      if (jobProfile?.needsVisaSponsorship !== null && jobProfile?.needsVisaSponsorship !== undefined) applicationLines.push(`Precisa de patrocínio de visto: ${jobProfile.needsVisaSponsorship ? "Sim" : "Não"}`);
      if (jobProfile?.citizenshipStatus) applicationLines.push(`Cidadania/residência: ${jobProfile.citizenshipStatus}`);
      if (jobProfile?.englishLevel) applicationLines.push(`Nível de inglês: ${jobProfile.englishLevel}`);
      if (jobProfile?.currentEmployer) applicationLines.push(`Empregador atual/anterior: ${jobProfile.currentEmployer}`);
      if (jobProfile?.currentRole) applicationLines.push(`Cargo atual/anterior: ${jobProfile.currentRole}`);
      if (jobProfile?.latestSchool) applicationLines.push(`Escola mais recente: ${jobProfile.latestSchool}`);
      if (jobProfile?.latestDegree) applicationLines.push(`Grau/formação mais recente: ${jobProfile.latestDegree}`);
      if (jobProfile?.currentSalary) applicationLines.push(`Salário atual: ${jobProfile.currentSalary}`);
      if (jobProfile?.onsiteAvailability) applicationLines.push(`Disponibilidade presencial/híbrida: ${jobProfile.onsiteAvailability}`);
      if (jobProfile?.applicationSource) applicationLines.push(`Fonte da vaga: ${jobProfile.applicationSource}`);
      if (applicationLines.length > 0) text = `${text}\n\nDADOS PARA FORMULÁRIOS DE CANDIDATURA\n${applicationLines.join("\n")}`;
      return NextResponse.json({
        text,
        mailto: `mailto:?subject=Currículo - ${user.name}&body=${encodeURIComponent(text)}`,
        user: { name: user.name, email: user.email },
        jobProfile,
        resumeVersion: principalVersion
      });
    }

    const lines: string[] = [
      `Nome: ${user.name}`,
      `E-mail: ${user.email}`,
    ];
    if (jobProfile?.phone) lines.push(`Telefone: ${jobProfile.phone}`);
    if (jobProfile?.city || jobProfile?.state) lines.push(`Localização: ${[jobProfile?.city, jobProfile?.state].filter(Boolean).join(", ")}`);
    if (jobProfile?.linkedin) lines.push(`LinkedIn: ${jobProfile.linkedin}`);
    if (jobProfile?.location) lines.push(`Localização completa: ${jobProfile.location}`);
    if (jobProfile?.country) lines.push(`País: ${jobProfile.country}`);
    if (jobProfile?.countryCode) lines.push(`Código do país: ${jobProfile.countryCode}`);
    if (jobProfile?.workAuthorization) lines.push(`Autorização de trabalho: ${jobProfile.workAuthorization}`);
    if (jobProfile?.needsVisaSponsorship !== null && jobProfile?.needsVisaSponsorship !== undefined) lines.push(`Precisa de patrocínio de visto: ${jobProfile.needsVisaSponsorship ? "Sim" : "Não"}`);
    if (jobProfile?.citizenshipStatus) lines.push(`Cidadania/residência: ${jobProfile.citizenshipStatus}`);
    if (jobProfile?.englishLevel) lines.push(`Nível de inglês: ${jobProfile.englishLevel}`);
    if (jobProfile?.currentEmployer) lines.push(`Empregador atual/anterior: ${jobProfile.currentEmployer}`);
    if (jobProfile?.currentRole) lines.push(`Cargo atual/anterior: ${jobProfile.currentRole}`);
    if (jobProfile?.latestSchool) lines.push(`Escola mais recente: ${jobProfile.latestSchool}`);
    if (jobProfile?.latestDegree) lines.push(`Grau/formação mais recente: ${jobProfile.latestDegree}`);
    if (jobProfile?.currentSalary) lines.push(`Salário atual: ${jobProfile.currentSalary}`);
    if (jobProfile?.onsiteAvailability) lines.push(`Disponibilidade presencial/híbrida: ${jobProfile.onsiteAvailability}`);
    if (jobProfile?.applicationSource) lines.push(`Fonte da vaga: ${jobProfile.applicationSource}`);
    if (jobProfile?.pretensaoMin || jobProfile?.pretensaoMax) {
      const range = [jobProfile?.pretensaoMin, jobProfile?.pretensaoMax]
        .filter(Boolean)
        .map((v) => `R$ ${v}`)
        .join(" - ");
      lines.push(`Pretensão salarial: ${range}`);
    }
    const topProfiles = (jobProfile?.topProfileNames as string[]) ?? [];
    if (topProfiles.length > 0) lines.push(`Áreas de aptidão: ${topProfiles.join(", ")}`);
    const strengths = (jobProfile?.strengths as string[]) ?? [];
    if (strengths.length > 0) lines.push(`Forças: ${strengths.join(", ")}`);
    if (jobProfile?.summary) lines.push("", jobProfile.summary);

    const text = lines.join("\n");

    return NextResponse.json({
      text,
      mailto: `mailto:?subject=Currículo - ${user.name}&body=${encodeURIComponent(text)}`,
      user: { name: user.name, email: user.email },
      jobProfile
    });
  } catch (error) {
    await logError("Falha ao carregar dados de currículo para cópia", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível carregar os dados." }, { status: 500 });
  }
}
