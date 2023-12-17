import { Injectable } from "@nestjs/common";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { v4 as uuidv4 } from "uuid";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

@Injectable()
export class UploadService {
  private readonly s3Client = new S3Client({
    region: APP_ENV_VARS.aws.region,
    credentials: {
      accessKeyId: APP_ENV_VARS.aws.accessKeyId,
      secretAccessKey: APP_ENV_VARS.aws.secretAccessKey,
    },
  });

  async upload(file: Buffer, mimeType: string): Promise<string> {
    const prefix = "audio-meals";
    const fileName = `${prefix}/${uuidv4()}`;

    myLogger.info("uploading audio file", { fileName, mimeType });

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: APP_ENV_VARS.aws.s3.bucket,
        Key: fileName,
        Body: file,
        ContentType: mimeType,
      })
    );

    myLogger.info("audio file uploaded", { fileName, mimeType });

    return fileName;
  }
}
