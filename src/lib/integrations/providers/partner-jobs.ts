import { IntegrationError, INTEGRATION_ERRORS } from "../errors";
import { JobProvider } from "./base";

export class PartnerJobProvider extends JobProvider {
  constructor(readonly providerSlug: string, readonly providerName: string) {
    super();
  }

  slug = this.providerSlug;
  name = this.providerName;

  async searchJobs() {
    this.requireEnv("PARTNER_JOBS_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_REQUIRES_PARTNER_ACCESS, `${this.name} requer API/parceria configurada.`);
  }

  async importJobs() {
    this.requireEnv("PARTNER_JOBS_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_REQUIRES_PARTNER_ACCESS, `${this.name} requer API/parceria configurada.`);
  }

  async getJobDetails() {
    this.requireEnv("PARTNER_JOBS_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_REQUIRES_PARTNER_ACCESS, `${this.name} requer API/parceria configurada.`);
  }

  async submitApplication() {
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_REQUIRES_PARTNER_ACCESS, `${this.name} não permite candidatura automática sem API/parceria oficial.`);
  }
}

export class GupyProvider extends PartnerJobProvider {
  constructor() {
    super("gupy", "Gupy");
  }
}

export class VagasComProvider extends PartnerJobProvider {
  constructor() {
    super("vagas-com-br", "Vagas.com.br");
  }
}

export class InfoJobsProvider extends PartnerJobProvider {
  constructor() {
    super("infojobs", "InfoJobs");
  }
}

export class IndeedBrasilProvider extends PartnerJobProvider {
  constructor() {
    super("indeed-brasil", "Indeed Brasil");
  }
}

export class CathoProvider extends PartnerJobProvider {
  constructor() {
    super("catho", "Catho");
  }
}
