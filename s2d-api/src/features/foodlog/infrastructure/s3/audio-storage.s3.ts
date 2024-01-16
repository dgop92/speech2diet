import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { IAudioStorage } from "@features/foodlog/ports/audio-storage.definition";
import { AudioMetadataCreateInput } from "@features/foodlog/schema-types";
import { v4 as uuidv4 } from "uuid";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class AudioS3Storage implements IAudioStorage {
  private readonly s3Client;

  constructor(private readonly bucketName: string) {
    this.s3Client = new S3Client();
  }
  async upload(
    buffer: Buffer,
    metadata: AudioMetadataCreateInput
  ): Promise<string> {
    const prefix = "audio-meals";
    const fileName = `${prefix}/${uuidv4()}`;

    myLogger.info("uploading audio file", {
      fileName,
      mimeType: metadata.data.mimeType,
    });

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: metadata.data.mimeType,
      })
    );

    myLogger.info("audio file uploaded", {
      fileName,
      mimeType: metadata.data.mimeType,
    });

    return fileName;
  }
}
