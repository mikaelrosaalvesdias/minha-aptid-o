type LeverPosting = {
  id: string;
  text: string;
  descriptionPlain: string;
  categories: { team: string; location: string; commitment: string };
  applyUrl: string;
  alternativeNames: string[];
};

// Fallback hardcoded se a tabela ATSBoard estiver vazia.
const FALLBACK_COMPANIES = [
  "veeva", "segment", "cruise", "khanacademy",
  "gitlab", "launchdarkly", "robinhood", "scale"
];

async function getActiveCompanies(): Promise<{ boardKey: string; label: string }[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const boards = await prisma.aTSBoard.findMany({
      where: { source: "lever", active: true },
      select: { boardKey: true, label: true }
    });
    if (boards.length > 0) return boards;
  } catch {}
  return FALLBACK_COMPANIES.map((c) => ({ boardKey: c.trim(), label: c.trim() }));
}

export function leverPostingsUrl(company: string): string {
  return `https://api.lever.co/v1/postings/${company}?mode=json`;
}

// Busca vagas em postings Lever curados, filtrando por termo.
export async function searchLever(term: string): Promise<{
  source: string;
  atsBoard: string;
  atsJobId: string;
  title: string;
  company: string;
  city?: string;
  state?: string;
  modelo?: string;
  description?: string;
  originalUrl: string;
  sourceAutoSupport: "auto";
  confidence: number;
}[]> {
  const results: Awaited<ReturnType<typeof searchLever>> = [];
  const termLower = term.toLowerCase().trim();

  const companies = await getActiveCompanies();

  await Promise.all(
    companies.map(async (company) => {
      const cleanCompany = company.boardKey.trim();
      try {
        const res = await fetch(leverPostingsUrl(cleanCompany), {
          headers: { Accept: "application/json" },
          next: { revalidate: 60 * 30 }
        });
        if (!res.ok) return;
        const data = (await res.json()) as { data: LeverPosting[] };
        const postings = data.data ?? [];

        for (const posting of postings) {
          const titleLower = posting.text.toLowerCase();
          if (termLower && !titleLower.includes(termLower) && !termLower.includes(titleLower.split(" ")[0])) {
            continue;
          }
          const locationName = posting.categories?.location ?? "";
          const isRemote = /remote|worldwide|global|anywhere/i.test(locationName);
          results.push({
            source: "lever",
            atsBoard: cleanCompany,
            atsJobId: posting.id,
            title: posting.text,
            company: company.label.charAt(0).toUpperCase() + company.label.slice(1),
            city: undefined,
            state: undefined,
            modelo: isRemote ? "remoto" : undefined,
            description: posting.descriptionPlain?.slice(0, 1200) || undefined,
            originalUrl: posting.applyUrl,
            sourceAutoSupport: "auto",
            confidence: 0.9
          });
        }
      } catch {}
    })
  );

  return results.slice(0, 30);
}

// Candidatura real via API pública Lever.
// POST https://api.lever.co/v1/postings/{id}/apply
// Sem auth. Sem credencial armazenada.
export async function applyToLever(
  postingId: string,
  resume: {
    name: string;
    email: string;
    phone?: string;
    summary?: string;
    strengths?: string[];
    topProfileNames?: string[];
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const resumeText = [
      resume.summary || "",
      `Perfil de aptidão: ${(resume.topProfileNames ?? []).join(", ")}`,
      `Forças: ${(resume.strengths ?? []).join(", ")}`,
      ""
    ].join("\n");

    const formData = new FormData();
    formData.append("name", resume.name);
    formData.append("emails", resume.email);
    if (resume.phone) formData.append("phones", resume.phone);
    const resumeBlob = new Blob([resumeText], { type: "text/plain" });
    formData.append("resume", resumeBlob, "curriculo.txt");

    const res = await fetch(`https://api.lever.co/v1/postings/${postingId}/apply`, {
      method: "POST",
      body: formData,
      next: { revalidate: 0 }
    });

    if (res.ok) {
      return { success: true };
    }

    const errorText = await res.text().catch(() => "");
    return { success: false, error: `Lever ${res.status}: ${errorText.slice(0, 200)}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
