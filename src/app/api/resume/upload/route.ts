import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logError } from "@/lib/logging";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

// Extração simples de texto de PDF: procura texto entre stream/endstream.
// Não usa libs externas — conservador, funciona para PDFs com texto embutido.
function extractPdfText(bytes: Uint8Array): string {
  try {
    const text = new TextDecoder("latin1").decode(bytes);
    const streams: string[] = [];
    const regex = /stream\r?\n([\s\S]*?)endstream/g;
    let match;
    while ((match = regex.exec(text)) !== null && streams.length < 20) {
      streams.push(match[1]);
    }
    const decoded = streams
      .map((s) => s.replace(/[^\x20-\x7E\n\ráéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]/g, " "))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return decoded.slice(0, 8000);
  } catch {
    return "";
  }
}

function extractPlainText(bytes: Uint8Array, type: string): string {
  if (type === "text/plain") {
    return new TextDecoder().decode(bytes).slice(0, 8000);
  }
  if (type === "application/pdf") {
    return extractPdfText(bytes);
  }
  return "";
}

export async function POST(request: Request) {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Arquivo muito grande. Tamanho máximo: 2MB." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt)$/i)) {
      return NextResponse.json({ error: "Tipo de arquivo não suportado. Envie PDF, DOC, DOCX ou TXT." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const extractedText = extractPlainText(bytes, file.type || "application/pdf");

    const resume = await prisma.resume.upsert({
      where: { userId },
      create: {
        userId,
        uploadedFileName: file.name,
        uploadedFileData: Buffer.from(arrayBuffer),
        uploadedFileType: file.type || "application/octet-stream",
        uploadedFileSize: file.size,
        uploadedText: extractedText,
        uploadedAt: new Date(),
        activeResumeType: "uploaded"
      },
      update: {
        uploadedFileName: file.name,
        uploadedFileData: Buffer.from(arrayBuffer),
        uploadedFileType: file.type || "application/octet-stream",
        uploadedFileSize: file.size,
        uploadedText: extractedText,
        uploadedAt: new Date(),
        activeResumeType: "uploaded"
      }
    });

    return NextResponse.json({
      ok: true,
      fileName: resume.uploadedFileName,
      fileSize: resume.uploadedFileSize,
      activeResumeType: resume.activeResumeType,
      hasText: Boolean(extractedText)
    });
  } catch (error) {
    await logError("Falha no upload de currículo", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível enviar o arquivo." }, { status: 500 });
  }
}

export async function DELETE() {
  const userId = await getSession();
  if (!userId) return NextResponse.json({ error: "Faça login." }, { status: 401 });

  try {
    await prisma.resume.update({
      where: { userId },
      data: {
        uploadedFileName: null,
        uploadedFileData: null,
        uploadedFileType: null,
        uploadedFileSize: null,
        uploadedText: null,
        uploadedAt: null,
        activeResumeType: "builder"
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("Falha ao remover currículo enviado", { error: String(error) });
    return NextResponse.json({ error: "Não foi possível remover o arquivo." }, { status: 500 });
  }
}
