#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { loadEnvironmentVariables } from "../config/app-env-vars";
import { getStackName } from "../config/utils";
import { StorageStack } from "../lib/storage/storage-stack";
import { LambdaStack } from "../lib/compute/lambda/lambda-stack";
import { NetworkStack } from "../lib/network/vpc";
import { S2DAPIStack } from "../lib/compute/s2d-api/s2d-api-stack";

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

const fitvoiceNetworkStackName = getStackName(
  config.appName,
  "network",
  config.env
);

const fitvoiceNetworkStack = new NetworkStack(app, fitvoiceNetworkStackName, {
  env: {
    region: config.region,
    account: config.accountId,
  },
  config: config,
});
cdk.Tags.of(fitvoiceNetworkStack).add("project:name", config.appName);
cdk.Tags.of(fitvoiceNetworkStack).add("project:env", config.env);
cdk.Tags.of(fitvoiceNetworkStack).add("project:stack", "network");

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

const fitvoiceS2DStackName = getStackName(
  config.appName,
  "s2d-api",
  config.env
);
const fitvoiceS2DStack = new S2DAPIStack(app, fitvoiceS2DStackName, {
  env: {
    region: config.region,
    account: config.accountId,
  },
  config: config,
  vpc: fitvoiceNetworkStack.vpc,
  mainBucket: fitvoiceStorageStack.mainBucket,
  nutritionRequestQueue: fitvoiceStorageStack.nutritionRequestQueue,
});
cdk.Tags.of(fitvoiceS2DStack).add("project:name", config.appName);
cdk.Tags.of(fitvoiceS2DStack).add("project:env", config.env);
cdk.Tags.of(fitvoiceS2DStack).add("project:stack", "s2d-api");
