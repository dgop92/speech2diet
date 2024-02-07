import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { getCloudFormationID, getResourceName } from "../../config/utils";
import { AwsEnvStackProps } from "../utils/custom-types";

const commonRepoProps: ecr.RepositoryProps = {
  imageScanOnPush: false,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
  emptyOnDelete: true,
  imageTagMutability: ecr.TagMutability.MUTABLE,
};

export interface ECRRepositoryStackProps extends AwsEnvStackProps {}

export class ECRRepositoryStack extends cdk.Stack {
  public readonly s2nEcrRepository: ecr.Repository;
  public readonly s2dApiEcrRepository: ecr.Repository;
  public readonly mrrUploadEcrRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props: ECRRepositoryStackProps) {
    super(scope, id, props);

    this.s2nEcrRepository = new ecr.Repository(
      this,
      getCloudFormationID(id, "s2n"),
      {
        repositoryName: getResourceName(id, "s2n"),
        ...commonRepoProps,
      }
    );
    this.s2dApiEcrRepository = new ecr.Repository(
      this,
      getCloudFormationID(id, "s2d-api"),
      {
        repositoryName: getResourceName(id, "s2d-api"),
        ...commonRepoProps,
      }
    );
    this.mrrUploadEcrRepository = new ecr.Repository(
      this,
      getCloudFormationID(id, "mrr-upload"),
      {
        repositoryName: getResourceName(id, "mrr-upload"),
        ...commonRepoProps,
      }
    );
  }
}
