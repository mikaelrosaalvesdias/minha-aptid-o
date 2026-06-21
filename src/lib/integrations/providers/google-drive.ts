import { IntegrationError, INTEGRATION_ERRORS } from "../errors";
import { JobProvider } from "./base";

export class GoogleDriveProvider extends JobProvider {
  slug = "google-drive";
  name = "Google Drive";

  async connectAccount() {
    this.requireEnv("COMPOSIO_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, "Google Drive ainda não está configurado com Composio/OAuth.");
  }

  async uploadResume() {
    this.requireEnv("COMPOSIO_API_KEY");
    throw new IntegrationError(INTEGRATION_ERRORS.PROVIDER_NOT_CONFIGURED, "Google Drive ainda não está configurado com Composio/OAuth.");
  }
}
