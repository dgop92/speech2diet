import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as iam from "aws-cdk-lib/aws-iam";
import { getCloudFormationID, getResourceName } from "../../../config/utils";
import { AwsEnvStackProps } from "../../utils/custom-types";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { S2NLambda } from "./s2n-lambda";
import { MRRUploadLambda } from "./mrr-upload-lambda";

export interface LambdaStackProps extends AwsEnvStackProps {
  mainBucket: s3.Bucket;
  nutritionRequestQueue: sqs.Queue;
  nutritionResponseQueue: sqs.Queue;
}

export class LambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { mainBucket, nutritionRequestQueue, nutritionResponseQueue } = props;

    const nutritionRequestEventSource = new SqsEventSource(
      nutritionRequestQueue,
      {
        batchSize: 1,
        enabled: true,
      }
    );
    const s2nLambdaServicePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["sqs:SendMessage", "s3:GetObject"],
      resources: [
        nutritionResponseQueue.queueArn,
        mainBucket.arnForObjects("*"),
      ],
    });
    new S2NLambda(this, getCloudFormationID(id, "s2n-service-lambda"), {
      functionName: getResourceName(id, "s2n-service-lambda"),
      sqsEventSource: nutritionRequestEventSource,
      policyStatement: s2nLambdaServicePolicy,
      s3BucketName: mainBucket.bucketName,
      nutritionResponseQueueUrl: nutritionResponseQueue.queueUrl,
      env: props.config.env,
      getSecretParamName: (name: string) => {
        return `/${props.config.appName}/${props.config.env}/s2n/${name}`;
      },
    });

    const nutritionResponseEventSource = new SqsEventSource(
      nutritionResponseQueue,
      {
        batchSize: 1,
        enabled: true,
      }
    );
    new MRRUploadLambda(
      this,
      getCloudFormationID(id, "mrr-upload-service-lambda"),
      {
        functionName: getResourceName(id, "mrr-upload-service-lambda"),
        sqsEventSource: nutritionResponseEventSource,
        env: props.config.env,
        getSecretParamName: (name: string) => {
          return `/${props.config.appName}/${props.config.env}/mrr-upload/${name}`;
        },
      }
    );
  }
}
