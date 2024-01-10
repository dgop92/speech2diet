import { getOsEnv, getOsEnvOrDefault } from "./env-utils";
import { getEncryptedParameter } from "./parameter-store";

export async function getAppSecret(name: string) {
  // specify where to get the secret from, available options are: ssm, env
  const secretFrom = getOsEnvOrDefault("SECRET_FROM", "env");
  const nodeEnv = getOsEnv("NODE_ENV");

  if (secretFrom === "env") {
    return getOsEnv(name);
  }

  if (secretFrom === "ssm") {
    const parameterName = `/fitvoice-app/${nodeEnv}/s2d-api/${name}`;
    return getEncryptedParameter(parameterName);
  }

  throw new Error(
    `Invalid SECRET_FROM value: ${secretFrom}, valid values are: env, ssm`
  );
}
