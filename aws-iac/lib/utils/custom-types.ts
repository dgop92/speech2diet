import * as cdk from "aws-cdk-lib";
import { BuildConfig } from "../../config/app-env-vars";

export interface AwsEnvStackProps extends cdk.StackProps {
  config: Readonly<BuildConfig>;
}
