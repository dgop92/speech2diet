import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import { AwsEnvStackProps } from "../../utils/custom-types";
import { getCloudFormationID, getResourceName } from "../../../config/utils";

export interface S2DAPIRepoStackProps extends AwsEnvStackProps {}

export class S2DAPIRepoStack extends cdk.Stack {
  public readonly ecrRepository: ecr.Repository;

  constructor(scope: Construct, id: string, props: S2DAPIRepoStackProps) {
    super(scope, id, props);
    // Create ecr repository
    this.ecrRepository = new ecr.Repository(
      this,
      getCloudFormationID(id, "ecr-repo"),
      {
        repositoryName: getResourceName(id, "s2d-api-ecr-repo"),
        imageScanOnPush: false,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        emptyOnDelete: true,
        imageTagMutability: ecr.TagMutability.MUTABLE,
      }
    );
  }
}
