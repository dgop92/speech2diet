import { AppLogger } from "@common/logging/logger";
import { IAudioStorage } from "../ports/audio-storage.definition";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AudioMockStorage } from "../infrastructure/s3/audio-storage.mock";
import { AudioS3Storage } from "../infrastructure/s3/audio-storage.s3";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let audioStorage: IAudioStorage;

export const myAudioStorageFactory = () => {
  myLogger.info("calling myAudioStorageFactory");

  if (audioStorage === undefined) {
    if (APP_ENV_VARS.isTest) {
      myLogger.info("creating mock audio storage");
      audioStorage = new AudioMockStorage();
      myLogger.info("created mock audio storage");
    } else {
      myLogger.info("creating s3 audio storage");
      audioStorage = new AudioS3Storage(APP_ENV_VARS.aws.s3.bucket);
      myLogger.info("created s3 audio storage");
    }
  }

  return {
    audioStorage,
  };
};
