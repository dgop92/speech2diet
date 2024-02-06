import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as apprunner from "aws-cdk-lib/aws-apprunner";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

import { AwsEnvStackProps } from "../../utils/custom-types";
import { getCloudFormationID } from "../../../config/utils";

type S2DAPIConfig = {
  NODE_ENV: string;
  LOG_LEVEL: string;
  SECRETS_FROM: string;
  AWS_NUTRITION_REQUEST_QUEUE_URL: string;
  AWS_S3_BUCKET: string;
};

function getEnvironmentVariablesFromEnv(
  env: string,
  queueUrl: string,
  bucketName: string
): S2DAPIConfig {
  const shareConfig = {
    AWS_NUTRITION_REQUEST_QUEUE_URL: queueUrl,
    AWS_S3_BUCKET: bucketName,
  };

  if (env === "test") {
    return {
      NODE_ENV: "test",
      LOG_LEVEL: "debug",
      SECRETS_FROM: "ssm",
      ...shareConfig,
    };
  }

  if (env === "prod") {
    return {
      NODE_ENV: "prod",
      LOG_LEVEL: "info",
      SECRETS_FROM: "ssm",
      ...shareConfig,
    };
  }

  if (env === "dev") {
    return {
      NODE_ENV: "dev",
      LOG_LEVEL: "info",
      SECRETS_FROM: "ssm",
      ...shareConfig,
    };
  }

  throw new Error("Invalid environment");
}

export interface S2DAPIStackProps extends AwsEnvStackProps {
  nutritionRequestQueue: sqs.Queue;
  mainBucket: s3.Bucket;
  autoScalingConfigARN: string;
  ecrRepository: ecr.Repository;
}

export class S2DAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S2DAPIStackProps) {
    super(scope, id, props);

    // Role and policies for the app runner
    const s2dServicePolicyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ["s3:PutObject", "sqs:SendMessage"],
          resources: [
            props.mainBucket.arnForObjects("*"),
            props.nutritionRequestQueue.queueArn,
          ],
        }),
      ],
    });
    const s2dInstanceRole = new iam.Role(
      this,
      getCloudFormationID(id, "s2d-apprunner-role"),
      {
        assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
        description: "Role for the S2D API App Runner application",
        inlinePolicies: {
          s2dServicePolicy: s2dServicePolicyDocument,
        },
      }
    );
    const secrets: { id: string; paramName: string }[] = [
      {
        id: "mrr-upload-api-key-parameter",
        paramName: "MRR_UPLOAD_API_KEY",
      },
      {
        id: "google-application-credentials-content-parameter",
        paramName: "GOOGLE_APPLICATION_CREDENTIALS_CONTENT",
      },
    ];
    secrets.forEach((secret) => {
      const param = StringParameter.fromSecureStringParameterAttributes(
        this,
        secret.id,
        {
          parameterName: `/${props.config.appName}/${props.config.env}/s2d-api/${secret.paramName}`,
        }
      );
      param.grantRead(s2dInstanceRole);
    });

    const appRunnerAcessRole = new iam.Role(
      this,
      getCloudFormationID(id, "s2d-api-apprunner-access-role"),
      {
        assumedBy: new iam.ServicePrincipal("build.apprunner.amazonaws.com"),
        description: "App Runner access role for the S2D API",
        inlinePolicies: {
          "apprunner-access-policy": new iam.PolicyDocument({
            statements: [
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ["ecr:GetAuthorizationToken"],
                resources: ["*"],
              }),
              new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                  "ecr:BatchCheckLayerAvailability",
                  "ecr:GetDownloadUrlForLayer",
                  "ecr:GetRepositoryPolicy",
                  "ecr:DescribeRepositories",
                  "ecr:ListImages",
                  "ecr:DescribeImages",
                  "ecr:BatchGetImage",
                  "ecr:ListTagsForResource",
                  "ecr:DescribeImageScanFindings",
                ],
                resources: [props.ecrRepository.repositoryArn],
              }),
            ],
          }),
        },
      }
    );

    const appEnvVarsAsList = Object.entries(
      getEnvironmentVariablesFromEnv(
        props.config.env,
        props.nutritionRequestQueue.queueUrl,
        props.mainBucket.bucketName
      )
    ).map(([key, value]) => ({ name: key, value }));

    new apprunner.CfnService(
      this,
      getCloudFormationID(id, "s2d-api-apprunner-service"),
      {
        serviceName: "s2d-api-service",
        sourceConfiguration: {
          authenticationConfiguration: {
            accessRoleArn: appRunnerAcessRole.roleArn,
          },
          autoDeploymentsEnabled: false,
          imageRepository: {
            imageIdentifier: props.ecrRepository.repositoryUriForTag("latest"),
            imageRepositoryType: "ECR",
            imageConfiguration: {
              port: "8080",
              runtimeEnvironmentVariables: appEnvVarsAsList,
            },
          },
        },
        instanceConfiguration: {
          instanceRoleArn: s2dInstanceRole.roleArn,
          cpu: "256",
          memory: "512",
        },
        autoScalingConfigurationArn: props.autoScalingConfigARN,
      }
    );
  }
}
