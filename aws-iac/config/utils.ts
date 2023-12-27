/**
 * Returns the stack name based on the provided application name and environment.
 * @param appName - The name of the application.
 * @param env - The environment (e.g., development, production).
 * @returns The stack name in the format "appName-env-stack".
 */
export function getStackName(appName: string, env: string) {
  return `${appName}-${env}-stack`;
}

/**
 * Generates a unique CloudFormation ID by combining the provided ID and name.
 * @param id - The ID is the stack name.
 * @param name - Your custom name for the resource.
 * @returns The generated CloudFormation ID.
 */
export function getCloudFormationID(id: string, name: string) {
  return `${id}-${name}-id`;
}

/**
 * Generates a resource name by concatenating an ID and a name.
 * @param id - The ID is the stack name.
 * @param name - Your custom name for the resource.
 * @returns The generated resource name.
 */
export function getResourceName(id: string, name: string) {
  return `${id}-${name}`;
}
