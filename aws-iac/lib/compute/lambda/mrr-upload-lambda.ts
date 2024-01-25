import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { getRootOfExternalProject } from "../../../config/utils";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

type MRRUploadServiceConfig = {
  NODE_ENV: string;
  LOG_LEVEL: string;
  SECRETS_FROM: string;
};

export interface MRRUploadLambdaProps {
  sqsEventSource: SqsEventSource;
  env: string;
  functionName: string;
  getSecretParamName: (name: string) => string;
}

function getEnvironmentVariablesFromEnv(env: string): MRRUploadServiceConfig {
  if (env === "test") {
    return {
      NODE_ENV: "test",
      LOG_LEVEL: "debug",
      SECRETS_FROM: "ssm",
    };
  }

  if (env === "prod") {
    return {
      NODE_ENV: "prod",
      LOG_LEVEL: "info",
      SECRETS_FROM: "ssm",
    };
  }

  if (env === "dev") {
    return {
      NODE_ENV: "dev",
      LOG_LEVEL: "info",
      SECRETS_FROM: "ssm",
    };
  }

  throw new Error("Invalid environment");
}

export class MRRUploadLambda extends Construct {
  public readonly lambdaFunc: lambda.DockerImageFunction;

  constructor(scope: Construct, id: string, props: MRRUploadLambdaProps) {
    super(scope, id);
    const { sqsEventSource, env, functionName, getSecretParamName } = props;

    const mrrUploadServiceConfig = getEnvironmentVariablesFromEnv(env);

    const mrrUploadProjectPath = getRootOfExternalProject("mrr-upload");
    const mrrUploadServiceLambda = new lambda.DockerImageFunction(this, id, {
      functionName: functionName,
      code: lambda.DockerImageCode.fromImageAsset(mrrUploadProjectPath, {
        file: "Dockerfile.lambda",
      }),
      timeout: cdk.Duration.seconds(60),
      memorySize: 256,
      architecture: lambda.Architecture.X86_64,
      environment: mrrUploadServiceConfig,
    });
    mrrUploadServiceLambda.addEventSource(sqsEventSource);

    const secrets: { id: string; paramName: string }[] = [
      {
        id: "mrr-upload-api-key-parameter",
        paramName: "MRR_UPLOAD_API_KEY",
      },
      {
        id: "s2d-server-create-mrr-endpoint-parameter",
        paramName: "S2D_SERVER_CREATE_MRR_ENDPOINT",
      },
    ];

    secrets.forEach((secret) => {
      const param = StringParameter.fromSecureStringParameterAttributes(
        this,
        secret.id,
        { parameterName: getSecretParamName(secret.paramName) }
      );
      param.grantRead(mrrUploadServiceLambda);
    });

    this.lambdaFunc = mrrUploadServiceLambda;
  }
}
