import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BuildConfig } from "../config/app-env-vars";

type AwsEnvStackProps = cdk.StackProps & {
  config: Readonly<BuildConfig>;
};

export class FitVoiceCDKStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    super(scope, id, props);
  }
}
