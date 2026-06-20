import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import type { TopProfileResult } from "@/lib/types";
import { ResumeBuilderClient } from "@/components/ResumeBuilderClient";

export const dynamic = "force-dynamic";

function asTopProfiles(value: unknown): TopProfileResult[] {
  return Array.isArray(value) ? (value as TopProfileResult[]) : [];
}
function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export default async function CurriculoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  
  if (!user) {
    redirect("/login");
  }

  const result = await prisma.result.findUnique({
    where: { id },
    include: { session: true }
  });

  if (!result) notFound();
  
  // Ensure the logged in user owns this result
  if (result.session.userId !== user.id) {
    redirect("/perfil");
  }

  const topProfiles = asTopProfiles(result.topProfiles);
  const mainProfile = topProfiles[0];
  const scores = result.scores as {
    detectedStrengths?: string[];
    detectedAttentionPoints?: string[];
  };
  
  const detectedStrengths = asStringArray(scores.detectedStrengths);
  const strengths = Array.from(new Set([...detectedStrengths, ...(mainProfile?.strengths ?? [])])).slice(0, 8);
  const profileNames = topProfiles.slice(0, 2).map(p => p.name);

  return (
    <ResumeBuilderClient 
      userName={user.name} 
      userEmail={user.email} 
      strengths={strengths} 
      profiles={profileNames} 
    />
  );
}
