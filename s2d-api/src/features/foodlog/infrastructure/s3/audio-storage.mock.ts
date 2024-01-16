import { IAudioStorage } from "@features/foodlog/ports/audio-storage.definition";
import { AudioMetadataCreateInput } from "@features/foodlog/schema-types";
import { v4 as uuidv4 } from "uuid";
import { AppLogger } from "@common/logging/logger";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

export class AudioMockStorage implements IAudioStorage {
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

    // do nothing, this is a mock

    myLogger.info("audio file uploaded", {
      fileName,
      mimeType: metadata.data.mimeType,
    });

    return fileName;
  }
}
