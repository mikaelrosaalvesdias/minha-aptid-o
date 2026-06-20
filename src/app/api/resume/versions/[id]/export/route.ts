import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";
import { resumeToPlainText, resumeToStructuredApplication } from "@/lib/resume/export";

export const dynamic = "force-dynamic";

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") ?? "text";

  try {
    const [user, resume, version] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
      prisma.resume.findUnique({ where: { userId } }),
      prisma.resumeVersion.findFirst({ where: { id, userId } })
    ]);
    if (!user || !resume || !version) return NextResponse.json({ error: "Currículo não encontrado." }, { status: 404 });

    const resumeData = {
      id: resume.id,
      title: resume.title,
      phone: resume.phone,
      linkedin: resume.linkedin,
      summary: resume.summary,
      photo: resume.photo,
      experiences: resume.experiences as Array<{ company: string; role: string; period: string; description: string }>,
      education: resume.education as Array<{ institution: string; course: string; period: string }>,
      topProfileNames: asArray(resume.topProfileNames),
      strengths: asArray(resume.strengths),
      uploadedText: resume.uploadedText,
      activeResumeType: resume.activeResumeType
    };
    const sectionConfig = version.sectionConfig as never;
    const exportItem = { format, exportedAt: new Date().toISOString(), versionId: version.id };
    const history = Array.isArray(version.exportHistory) ? version.exportHistory : [];
    await prisma.resumeVersion.update({ where: { id }, data: { exportHistory: [...history, exportItem].slice(-50) } });

    if (format === "structured") {
      return NextResponse.json({ data: resumeToStructuredApplication({ userName: user.name, userEmail: user.email, resume: resumeData, sectionConfig }) });
    }

    const text = resumeToPlainText({ userName: user.name, userEmail: user.email, resume: resumeData, sectionConfig, ats: format === "ats-text" });
    return new NextResponse(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="curriculo-${format}.txt"`
      }
    });
  } catch (error) {
    await logError("Falha ao exportar versão de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível exportar o currículo." }, { status: 500 });
  }
}
