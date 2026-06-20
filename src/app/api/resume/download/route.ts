import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const resume = await prisma.resume.findUnique({
      where: { userId },
      select: { uploadedFileData: true, uploadedFileName: true, uploadedFileType: true }
    });

    if (!resume?.uploadedFileData || !resume.uploadedFileName) {
      return NextResponse.json({ error: "Nenhum currículo enviado." }, { status: 404 });
    }

    return new NextResponse(resume.uploadedFileData, {
      headers: {
        "Content-Type": resume.uploadedFileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${resume.uploadedFileName}"`,
        "Content-Length": String(resume.uploadedFileData.length)
      }
    });
  } catch (error) {
    await logError("Falha ao baixar currículo enviado", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível baixar o arquivo." }, { status: 500 });
  }
}
