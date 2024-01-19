import { getOsEnv, getOsEnvOrDefault } from "./env-utils";
import { getEncryptedParameter } from "./parameter-store";

export async function getAppSecret(name: string) {
  // specify where to get the secret from, available options are: ssm, env
  const secretFrom = getOsEnvOrDefault("SECRETS_FROM", "env");
  const nodeEnv = getOsEnv("NODE_ENV");

  if (secretFrom === "env") {
    return getOsEnv(name);
  }

  if (secretFrom === "ssm") {
    const parameterName = `/fitvoice-app/${nodeEnv}/mrr-upload/${name}`;
    return getEncryptedParameter(parameterName);
  }

  throw new Error(
    `Invalid SECRET_FROM value: ${secretFrom}, valid values are: env, ssm`
  );
}
