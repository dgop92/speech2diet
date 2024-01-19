import { SSM } from "@aws-sdk/client-ssm";

const getParameterWorker = async (
  name: string,
  decrypt: boolean
): Promise<string> => {
  const ssm = new SSM();
  const result = await ssm.getParameter({
    Name: name,
    WithDecryption: decrypt,
  });

  if (result.Parameter?.Value === undefined) {
    throw new Error(`Parameter ${name} not found`);
  }
  return result.Parameter.Value;
};

export const getParameter = async (name: string): Promise<string> => {
  return getParameterWorker(name, false);
};

export const getEncryptedParameter = async (name: string): Promise<string> => {
  return getParameterWorker(name, true);
};
