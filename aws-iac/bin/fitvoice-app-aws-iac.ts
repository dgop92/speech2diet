#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { FitVoiceCDKStack } from "../lib/aws-fitvoice-test-stack";
import { loadEnvironmentVariables } from "../config/app-env-vars";
import { getStackName } from "../config/utils";

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
const appName = getStackName(config.appName, config.env);
const fitvoiceCDKStack = new FitVoiceCDKStack(app, appName, {
  env: {
    region: config.region,
    account: config.accountId,
  },
  config: config,
});
cdk.Tags.of(fitvoiceCDKStack).add("project:name", config.appName);
cdk.Tags.of(fitvoiceCDKStack).add("project:env", config.env);
