import { IntegrationError, INTEGRATION_ERRORS } from "../errors";
import { JobProvider } from "./base";

export class LinkedInProvider extends JobProvider {
  slug = "linkedin";
  name = "LinkedIn";

  async connectAccount() {
    this.requireEnv("COMPOSIO_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, "LinkedIn ainda não está configurado com Composio/OAuth.");
  }

  async syncProfile() {
    this.requireEnv("COMPOSIO_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, "LinkedIn ainda não está configurado com Composio/OAuth.");
  }
}
