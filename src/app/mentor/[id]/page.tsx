import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/auth";
import type { TopProfileResult } from "@/lib/types";
import { MentorChatClient } from "@/components/MentorChatClient";

export const dynamic = "force-dynamic";

function asTopProfiles(value: unknown): TopProfileResult[] {
  return Array.isArray(value) ? (value as TopProfileResult[]) : [];
}

export default async function MentorPage({ params }: { params: Promise<{ id: string }> }) {
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
  
  if (!result.session.userId || result.session.userId !== user.id) {
    redirect("/perfil");
  }

  const topProfiles = asTopProfiles(result.topProfiles);
  const mainProfile = topProfiles[0];
  const scores = result.scores as {
    detectedStrengths?: string[];
    detectedAttentionPoints?: string[];
  };
  
  const strengths = Array.from(new Set([...(scores.detectedStrengths || []), ...(mainProfile?.strengths ?? [])])).slice(0, 8);
  const attentionPoints = Array.from(new Set([...(scores.detectedAttentionPoints || []), ...(mainProfile?.attentionPoints ?? [])])).slice(0, 8);
  const profileNames = topProfiles.slice(0, 3).map(p => p.name);

  return (
    <MentorChatClient 
      userName={user.name} 
      resultId={id}
      contextData={{
        profiles: profileNames,
        strengths,
        attentionPoints
      }}
    />
  );
}
