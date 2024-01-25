import { getAppSecret } from "@common/config/secrets-vars";
import { foodlogFactory } from "@features/foodlog/factories";

export async function setupFactories() {
  const createMrrEndpoint = await getAppSecret(
    "S2D_SERVER_CREATE_MRR_ENDPOINT"
  );

  foodlogFactory(createMrrEndpoint);
}
