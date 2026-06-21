import { CathoProvider, GupyProvider, IndeedBrasilProvider, InfoJobsProvider, VagasComProvider } from "./partner-jobs";
import { LinkedInProvider } from "./linkedin";
import { ManualAssistedProvider } from "./manual-assisted";
import type { JobProvider } from "./base";

const providers = new Map<string, JobProvider>([
  ["linkedin", new LinkedInProvider()],
  ["gupy", new GupyProvider()],
  ["catho", new CathoProvider()],
  ["vagas-com-br", new VagasComProvider()],
  ["infojobs", new InfoJobsProvider()],
  ["indeed-brasil", new IndeedBrasilProvider()],
  ["manual-assisted", new ManualAssistedProvider()]
]);

export function getProvider(slug: string) {
  return providers.get(slug) ?? null;
}

export function listProviderSlugs() {
  return Array.from(providers.keys());
}
