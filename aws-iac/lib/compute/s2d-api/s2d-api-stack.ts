import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as autoscaling from "aws-cdk-lib/aws-autoscaling";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

import { AwsEnvStackProps } from "../../utils/custom-types";
import {
  getCloudFormationID,
  getResourceName,
  getRootOfExternalProject,
} from "../../../config/utils";

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
  vpc: ec2.Vpc;
  nutritionRequestQueue: sqs.Queue;
  mainBucket: s3.Bucket;
}

export class S2DAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S2DAPIStackProps) {
    super(scope, id, props);

    // Auto scaling group as the capacity provider for the ECS cluster

    const autoScalingGroup = new autoscaling.AutoScalingGroup(this, "asg", {
      vpc: props.vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      associatePublicIpAddress: true,
      maxCapacity: 1,
      minCapacity: 1,
      autoScalingGroupName: getResourceName(id, "asg"),
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // Role and policies for the EC2 instances from the auto scaling group

    const s2dServicePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:PutObject", "sqs:SendMessage"],
      resources: [
        props.mainBucket.bucketArn,
        props.nutritionRequestQueue.queueArn,
      ],
    });
    autoScalingGroup.addToRolePolicy(s2dServicePolicy);

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
      param.grantRead(autoScalingGroup);
    });

    // ECS cluster with the auto scaling group as the capacity provider

    const cluster = new ecs.Cluster(this, getCloudFormationID(id, "cluster"), {
      vpc: props.vpc,
      clusterName: getResourceName(id, "cluster"),
    });
    const asgCapacityProvider = new ecs.AsgCapacityProvider(
      this,
      getCloudFormationID(id, "asg-capacity-provider"),
      {
        autoScalingGroup,
        machineImageType: ecs.MachineImageType.AMAZON_LINUX_2,
        capacityProviderName: getResourceName(id, "asg-capacity-provider"),
      }
    );
    cluster.addAsgCapacityProvider(asgCapacityProvider, {
      canContainersAccessInstanceRole: true,
    });

    // Task definition for the s2d-api service

    const s2dAPIProjectPath = getRootOfExternalProject("s2d-api");

    const ec2TaskDefinition = new ecs.Ec2TaskDefinition(
      this,
      getCloudFormationID(id, "s2d-api-task-def"),
      {
        family: getResourceName(id, "s2d-api-task-def"),
        networkMode: ecs.NetworkMode.BRIDGE,
      }
    );
    ec2TaskDefinition.addContainer(
      getCloudFormationID(id, "s2d-api-container"),
      {
        containerName: getResourceName(id, "s2d-api-container"),
        image: ecs.ContainerImage.fromAsset(s2dAPIProjectPath, {
          file: "Dockerfile",
        }),
        memoryLimitMiB: 1024,
        cpu: 512,
        portMappings: [
          {
            containerPort: 8080,
            protocol: ecs.Protocol.TCP,
          },
        ],
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: getResourceName(id, "s2d-api"),
        }),
        environment: getEnvironmentVariablesFromEnv(
          props.config.env,
          props.nutritionRequestQueue.queueUrl,
          props.mainBucket.bucketName
        ),
      }
    );

    // load balancer and service for the s2d-api

    /* const loadBalancedEcsService =
      new ecsPatterns.ApplicationLoadBalancedEc2Service(
        this,
        getCloudFormationID(id, "s2d-api-ecs-pattern"),
        {
          serviceName: getResourceName(id, "s2d-api-service"),
          loadBalancerName: "s2d-api-alb",
          cluster: cluster,
          taskDefinition: ec2TaskDefinition,
          desiredCount: 1,
          publicLoadBalancer: true,
        }
      ); */
  }
}
