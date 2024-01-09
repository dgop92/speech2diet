import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { getRootOfExternalProject } from "../../config/utils";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

type S2NServiceConfig = {
  LOGGING_CONFIG_FILE: string;
  MOCK_SERVICES: string;
  SERVICE_ENVIRONMENT: string;
  SECRETS_FROM: string;
  AWS_S3_BUCKET: string;
  AWS_NUTRITION_RESPONSE_QUEUE_URL: string;
};

export interface S2nLambdaProps {
  sqsEventSource: SqsEventSource;
  policyStatement: iam.PolicyStatement;
  s3BucketName: string;
  nutritionResponseQueueUrl: string;
  env: string;
  functionName: string;
  getSecretParamName: (name: string) => string;
}

function getEnvironmentVariablesFromEnv(
  env: string
): Omit<
  S2NServiceConfig,
  "AWS_S3_BUCKET" | "AWS_NUTRITION_RESPONSE_QUEUE_URL"
> {
  if (env === "test") {
    return {
      LOGGING_CONFIG_FILE: "logging-dev.conf",
      MOCK_SERVICES: "True",
      SERVICE_ENVIRONMENT: "test",
      SECRETS_FROM: "ssm",
    };
  }

  if (env === "prod") {
    return {
      LOGGING_CONFIG_FILE: "logging-prod.conf",
      MOCK_SERVICES: "False",
      SERVICE_ENVIRONMENT: "prod",
      SECRETS_FROM: "ssm",
    };
  }

  if (env === "dev") {
    return {
      LOGGING_CONFIG_FILE: "logging-prod.conf",
      MOCK_SERVICES: "False",
      SERVICE_ENVIRONMENT: "dev",
      SECRETS_FROM: "ssm",
    };
  }

  throw new Error("Invalid environment");
}

export class S2NLambda extends Construct {
  public readonly lambdaFunc: lambda.DockerImageFunction;

  constructor(scope: Construct, id: string, props: S2nLambdaProps) {
    super(scope, id);
    const {
      sqsEventSource,
      policyStatement,
      s3BucketName,
      nutritionResponseQueueUrl,
      env,
      functionName,
      getSecretParamName,
    } = props;

    const s2nServiceConfig = getEnvironmentVariablesFromEnv(env);

    const s2nProjectPath = getRootOfExternalProject("speech2nutrition");
    const s2nServiceLambda = new lambda.DockerImageFunction(this, id, {
      functionName: functionName,
      code: lambda.DockerImageCode.fromImageAsset(s2nProjectPath, {
        file: "Dockerfile.lambda",
      }),
      /* 
        It takes 10 seconds roughly to init the function and the remaining time
        to bootstrap the external services of s2n

        Even though the function only takes 10-20 seconds we need to increase the 
        timeout. The external service diagram sometimes takes up to 3 minutes to 
        transcribe an audio if the servers are busy. One of the reasons for this 
        considerable amount of time is that we are using the free credits of service.
      */
      timeout: cdk.Duration.seconds(240),
      memorySize: 256,
      architecture: lambda.Architecture.X86_64,
      environment: {
        AWS_S3_BUCKET: s3BucketName,
        AWS_NUTRITION_RESPONSE_QUEUE_URL: nutritionResponseQueueUrl,
        ...s2nServiceConfig,
      },
    });
    s2nServiceLambda.addToRolePolicy(policyStatement);
    s2nServiceLambda.addEventSource(sqsEventSource);

    const secrets: { id: string; paramName: string }[] = [
      { id: "nutrition-mongo-url-parameter", paramName: "nutrition_mongo_url" },
      { id: "nutrition-db-name-parameter", paramName: "nutrition_db_name" },
      { id: "open-ai-engine-parameter", paramName: "open_ai_engine" },
      { id: "open-ai-key-parameter", paramName: "open_ai_key" },
      { id: "deepgram-key-parameter", paramName: "deepgram_key" },
    ];

    secrets.forEach((secret) => {
      const param = StringParameter.fromSecureStringParameterAttributes(
        this,
        secret.id,
        { parameterName: getSecretParamName(secret.paramName) }
      );
      param.grantRead(s2nServiceLambda);
    });

    this.lambdaFunc = s2nServiceLambda;
  }
}
