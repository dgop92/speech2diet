import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { AwsEnvStackProps } from "../utils/custom-types";
import { getCloudFormationID, getResourceName } from "../../config/utils";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { HttpMethod } from "aws-cdk-lib/aws-events";

export interface S2NDemoStackProps extends AwsEnvStackProps {}

export class S2NSDemotack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S2NDemoStackProps) {
    super(scope, id, props);

    // ECR Repository

    const ecrRepository = new ecr.Repository(
      this,
      getCloudFormationID(id, "repository"),
      {
        repositoryName: getResourceName(id, "repository"),
        imageScanOnPush: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        emptyOnDelete: true,
        imageTagMutability: ecr.TagMutability.MUTABLE,
      }
    );

    // Lambda Function

    const s2nDemoServiceLambda = new lambda.DockerImageFunction(
      this,
      getCloudFormationID(id, "lambda"),
      {
        functionName: getResourceName(id, "lambda"),
        code: lambda.DockerImageCode.fromEcr(ecrRepository, {
          tag: "latest",
        }),
        timeout: cdk.Duration.seconds(240),
        memorySize: 1024,
        architecture: lambda.Architecture.X86_64,
        environment: {
          LOGGING_CONFIG_FILE: "logging-prod.conf",
          MOCK_SERVICES: "False",
          SERVICE_ENVIRONMENT: "dev",
          SECRETS_FROM: "ssm",
        },
      }
    );

    const secrets: { id: string; paramName: string }[] = [
      { id: "nutrition-mongo-url-parameter", paramName: "nutrition_mongo_url" },
      { id: "nutrition-db-name-parameter", paramName: "nutrition_db_name" },
      {
        id: "nutrition-system-db-collection-name",
        paramName: "nutrition_system_db_collection_name",
      },
      {
        id: "nutrition-system-db-collection-index",
        paramName: "nutrition_system_db_collection_index",
      },
      { id: "open-ai-engine-parameter", paramName: "open_ai_engine" },
      { id: "open-ai-key-parameter", paramName: "open_ai_key" },
      { id: "deepgram-key-parameter", paramName: "deepgram_key" },
    ];

    secrets.forEach((secret) => {
      const param = StringParameter.fromSecureStringParameterAttributes(
        this,
        secret.id,
        {
          parameterName: `/${props.config.appName}/${props.config.env}/s2n/${secret.paramName}`,
        }
      );
      param.grantRead(s2nDemoServiceLambda);
    });

    // API Gateway

    const httpApi = new HttpApi(this, getCloudFormationID(id, "api-gateway"), {
      apiName: getResourceName(id, "api-gateway"),
    });
    httpApi.addRoutes({
      path: "/s2n-demo",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "s2n-demo-lambda-integration",
        s2nDemoServiceLambda
      ),
    });
  }
}
