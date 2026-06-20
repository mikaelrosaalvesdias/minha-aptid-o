import { NextResponse } from "next/server";
import { resumeTemplates } from "@/lib/resume/templates";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ templates: resumeTemplates.filter((template) => template.active) });
}
