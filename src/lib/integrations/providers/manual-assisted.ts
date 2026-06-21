import { JobProvider } from "./base";

export class ManualAssistedProvider extends JobProvider {
  slug = "manual-assisted";
  name = "Manual Assisted";

  async healthcheck() {
    return { ok: true, message: "Fluxo manual assistido disponível." };
  }
}
