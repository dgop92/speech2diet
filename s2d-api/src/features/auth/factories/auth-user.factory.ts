import { AppLogger } from "@common/logging/logger";
import { Auth as FirebaseAuth } from "firebase-admin/auth";
import { IAuthUserRepository } from "../ports/auth-user.repository.definition";
import { IAuthUserUseCase } from "../ports/auth-user.use-case.definition";
import { AuthUserUseCase } from "../use-cases/auth-user.use-case.";
import { FirebaseUserRepository } from "../infrastructure/firebase-auth/auth-user.firebase.repository";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AuthUserMockedRepository } from "../infrastructure/firebase-auth/auth-user.mock.repository";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let authUserRepository: IAuthUserRepository;
let authUserUseCase: IAuthUserUseCase;

export const myAuthUserFactory = (authFirebaseClient?: FirebaseAuth) => {
  myLogger.info("calling authUserFactory");

  if (authUserRepository === undefined) {
    myLogger.info("creating authUserRepository");
    const isEmulatorDefined = APP_ENV_VARS.firebase.authEmulatorHost !== "";
    // if we are in test mode and the emulator is not defined, we use the mock repository
    if (APP_ENV_VARS.isTest && !isEmulatorDefined) {
      myLogger.info("creating authUserRepository with mock");
      authUserRepository = new AuthUserMockedRepository();
    } else {
      if (!authFirebaseClient) {
        throw new Error("authFirebaseClient is undefined");
      }
      authUserRepository = new FirebaseUserRepository(authFirebaseClient);
    }
    myLogger.info("authUserRepository created");
  }

  if (authUserUseCase === undefined) {
    myLogger.info("creating authUserUseCase");
    authUserUseCase = new AuthUserUseCase(authUserRepository);
    myLogger.info("authUserUseCase created");
  }

  return {
    authUserRepository,
    authUserUseCase,
  };
};
