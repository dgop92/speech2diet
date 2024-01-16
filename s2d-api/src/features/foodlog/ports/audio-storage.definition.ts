import { AudioMetadataCreateInput } from "../schema-types";

export interface IAudioStorage {
  upload(buffer: Buffer, metadata: AudioMetadataCreateInput): Promise<string>;
}
