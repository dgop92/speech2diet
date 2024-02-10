import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { getCloudFormationID, getResourceName } from "../../config/utils";
import { AwsEnvStackProps } from "../utils/custom-types";

const commonQueueProps: sqs.QueueProps = {
  retentionPeriod: cdk.Duration.minutes(15),
  visibilityTimeout: cdk.Duration.seconds(300),
  deliveryDelay: cdk.Duration.seconds(0),
  receiveMessageWaitTime: cdk.Duration.seconds(20),
  // 10 KB
  maxMessageSizeBytes: 10240,
};

export class StorageStack extends cdk.Stack {
  public readonly mainBucket: s3.Bucket;
  public readonly nutritionRequestQueue: sqs.Queue;
  public readonly nutritionResponseQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: AwsEnvStackProps) {
    super(scope, id, props);

    this.mainBucket = new s3.Bucket(
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

    const nutritionRequestDeadLetterQueue = new sqs.Queue(
      this,
      getCloudFormationID(id, "nutrition-request-queue-dlq"),
      {
        queueName: getResourceName(id, "nutrition-request-queue-dlq"),
        ...commonQueueProps,
      }
    );

    this.nutritionRequestQueue = new sqs.Queue(
      this,
      getCloudFormationID(id, "nutrition-request-queue"),
      {
        queueName: getResourceName(id, "nutrition-request-queue"),
        ...commonQueueProps,
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: nutritionRequestDeadLetterQueue,
        },
      }
    );
    this.nutritionResponseQueue = new sqs.Queue(
      this,
      getCloudFormationID(id, "nutrition-response-queue"),
      {
        queueName: getResourceName(id, "nutrition-response-queue"),
        ...commonQueueProps,
      }
    );
  }
}
