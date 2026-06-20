type GreenhouseJob = {
  id: number;
  title: string;
  absolute_url: string;
  location: { name: string };
  departments: { name: string }[];
  metadata: { name: string; value: string }[];
};

type GreenhouseJobDetail = {
  title: string;
  content: string;
  location: { name: string };
  questions: { name: string; type: string; required: boolean; options?: string[] }[];
};

// Fallback hardcoded se a tabela ATSBoard estiver vazia (seed não rodou).
const FALLBACK_BOARDS = [
  "notion", "airtable", "stripe", "flexport", "datadog",
  "figma", "mercury", "loom", "vercel", "linear",
  "monzo", "revolut", "nubank", "canva", "deepl"
];

async function getActiveBoards(): Promise<{ boardKey: string; label: string }[]> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const boards = await prisma.aTSBoard.findMany({
      where: { source: "greenhouse", active: true },
      select: { boardKey: true, label: true }
    });
    if (boards.length > 0) return boards;
  } catch {}
  return FALLBACK_BOARDS.map((b) => ({ boardKey: b, label: b }));
}

export function greenhouseBoardUrl(board: string): string {
  return `https://boards-api.greenhouse.io/v1/boards/${board}`;
}

// Busca vagas em boards Greenhouse curados, filtrando por termo.
export async function searchGreenhouse(term: string): Promise<{
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
  sourceAutoSupport: "requires_employer_auth";
  confidence: number;
}[]> {
  const results: Awaited<ReturnType<typeof searchGreenhouse>> = [];
  const termLower = term.toLowerCase().trim();

  const boards = await getActiveBoards();

  await Promise.all(
    boards.map(async (board) => {
      try {
        const res = await fetch(`${greenhouseBoardUrl(board.boardKey)}/jobs?content=true`, {
          headers: { Accept: "application/json" },
          next: { revalidate: 60 * 30 }
        });
        if (!res.ok) return;
        const data = (await res.json()) as { jobs: GreenhouseJob[] };
        const jobs = data.jobs ?? [];

        for (const job of jobs) {
          const titleLower = job.title.toLowerCase();
          if (termLower && !titleLower.includes(termLower) && !termLower.includes(titleLower.split(" ")[0])) {
            continue;
          }
          const locationName = job.location?.name ?? "";
          const isRemote = /remote|worldwide|global|anywhere/i.test(locationName);
          results.push({
            source: "greenhouse",
            atsBoard: board.boardKey,
            atsJobId: String(job.id),
            title: job.title,
            company: board.label.charAt(0).toUpperCase() + board.label.slice(1),
            city: undefined,
            state: undefined,
            modelo: isRemote ? "remoto" : undefined,
            description: undefined,
            originalUrl: job.absolute_url,
            sourceAutoSupport: "requires_employer_auth",
            confidence: 0.9
          });
        }
      } catch {}
    })
  );

  return results.slice(0, 30);
}

// Candidatura real via API pública Greenhouse.
// POST https://boards-api.greenhouse.io/v1/boards/{board}/jobs/{id}
// Sem auth. Sem credencial armazenada. Dados enviados diretamente ao sistema da empresa.
export async function applyToGreenhouse(
  board: string,
  jobId: string,
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
    const [firstName, ...rest] = resume.name.trim().split(" ");
    const lastName = rest.join(" ") || firstName;

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", resume.email);
    if (resume.phone) formData.append("phone", resume.phone);

    const resumeText = [
      resume.summary || "",
      `Perfil de aptidão: ${(resume.topProfileNames ?? []).join(", ")}`,
      `Forças: ${(resume.strengths ?? []).join(", ")}`,
      ""
    ].join("\n");

    const resumeBlob = new Blob([resumeText], { type: "text/plain" });
    formData.append("resume", resumeBlob, "curriculo.txt");

    const res = await fetch(`${greenhouseBoardUrl(board)}/jobs/${jobId}`, {
      method: "POST",
      body: formData,
      next: { revalidate: 0 }
    });

    if (res.ok) {
      return { success: true };
    }

    const errorText = await res.text().catch(() => "");
    return { success: false, error: `Greenhouse ${res.status}: ${errorText.slice(0, 200)}` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
