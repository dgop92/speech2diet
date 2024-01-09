#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { loadEnvironmentVariables } from "../config/app-env-vars";
import { getStackName } from "../config/utils";
import { StorageStack } from "../lib/storage/storage-stack";
import { LambdaStack } from "../lib/compute/lambda-stack";

const app = new cdk.App();

function getConfig() {
  let envName = app.node.tryGetContext("config") as string;
  if (!envName) {
    throw new Error(
      "Context variable missing on CDK command. Pass in as `-c config=XXX`"
    );
  }

  const buildConfig = loadEnvironmentVariables(envName);
  return buildConfig;
}

const config = getConfig();
const fitvoiceStorageStackName = getStackName(
  config.appName,
  "storage",
  config.env
);
const fitvoiceStorageStack = new StorageStack(app, fitvoiceStorageStackName, {
  env: {
    region: config.region,
    account: config.accountId,
  },
  config: config,
});
cdk.Tags.of(fitvoiceStorageStack).add("project:name", config.appName);
cdk.Tags.of(fitvoiceStorageStack).add("project:env", config.env);
cdk.Tags.of(fitvoiceStorageStack).add("project:stack", "storage");

const fitvoiceLambdaStackName = getStackName(
  config.appName,
  "lambda",
  config.env
);
const fitvoiceLambdaStack = new LambdaStack(app, fitvoiceLambdaStackName, {
  env: {
    region: config.region,
    account: config.accountId,
  },
  config: config,
  mainBucket: fitvoiceStorageStack.mainBucket,
  nutritionRequestQueue: fitvoiceStorageStack.nutritionRequestQueue,
  nutritionResponseQueue: fitvoiceStorageStack.nutritionResponseQueue,
});
cdk.Tags.of(fitvoiceLambdaStack).add("project:name", config.appName);
cdk.Tags.of(fitvoiceLambdaStack).add("project:env", config.env);
cdk.Tags.of(fitvoiceLambdaStack).add("project:stack", "lambda");
