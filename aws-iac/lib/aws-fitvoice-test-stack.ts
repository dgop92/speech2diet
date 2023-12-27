import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BuildConfig } from "../config/app-env-vars";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import { getCloudFormationID, getResourceName } from "../config/utils";

type AwsEnvStackProps = cdk.StackProps & {
  config: Readonly<BuildConfig>;
};

const testQueueProps: sqs.QueueProps = {
  retentionPeriod: cdk.Duration.minutes(15),
  visibilityTimeout: cdk.Duration.seconds(60),
  deliveryDelay: cdk.Duration.seconds(0),
  receiveMessageWaitTime: cdk.Duration.seconds(20),
  // 10 KB
  maxMessageSizeBytes: 10240,
};

function createProgrammaticUser(
  construct: Construct,
  name: string,
  policies: iam.PolicyStatement[]
) {
  const user = new iam.User(
    construct,
    getCloudFormationID(construct.node.id, name),
    {
      userName: getResourceName(construct.node.id, name),
    }
  );
  policies.forEach((policy) => {
    user.addToPolicy(policy);
  });
  return user;
}

export class FitVoiceCDKStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    super(scope, id, props);

    const mainBucket = new s3.Bucket(
      this,
      getCloudFormationID(id, "main-bucket"),
      {
        bucketName: getResourceName(id, "main-bucket"),
        objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        versioned: false,
        encryption: s3.BucketEncryption.S3_MANAGED,
      }
    );

    const nutritionRequestQueue = new sqs.Queue(
      this,
      getCloudFormationID(id, "nutrition-request-queue"),
      {
        queueName: getResourceName(id, "nutrition-request-queue"),
        ...testQueueProps,
      }
    );
    const nutritionResponseQueue = new sqs.Queue(
      this,
      getCloudFormationID(id, "nutrition-response-queue"),
      {
        queueName: getResourceName(id, "nutrition-response-queue"),
        ...testQueueProps,
      }
    );

    // Creating the policies and users for the speech 2 nutrition service
    const s2nServicePolicy1 = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:GetObject", "sqs:DeleteMessage", "sqs:ReceiveMessage"],
      resources: [
        mainBucket.arnForObjects("*"),
        nutritionRequestQueue.queueArn,
      ],
    });
    const s2nServicePolicy2 = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sqs:SendMessage"],
      resources: [nutritionResponseQueue.queueArn],
    });
    createProgrammaticUser(this, "s2n-service-user", [
      s2nServicePolicy1,
      s2nServicePolicy2,
    ]);

    const s2dServicePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["s3:PutObject", "sqs:SendMessage"],
      resources: [
        mainBucket.arnForObjects("*"),
        nutritionRequestQueue.queueArn,
      ],
    });
    createProgrammaticUser(this, "s2d-service-user", [s2dServicePolicy]);

    const mrrUploadServicePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sqs:DeleteMessage", "sqs:ReceiveMessage"],
      resources: [nutritionResponseQueue.queueArn],
    });
    createProgrammaticUser(this, "mrr-upload-service-user", [
      mrrUploadServicePolicy,
    ]);
  }
}
