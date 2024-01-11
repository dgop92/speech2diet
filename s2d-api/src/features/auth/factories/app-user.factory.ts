import { AppLogger } from "@common/logging/logger";
import { AppUserRepository } from "../infrastructure/firestore/repositories/app-user.repository";
import { Firestore } from "firebase-admin/firestore";
import { IAppUserRepository } from "../ports/app-user.repository.definition";
import { IAppUserUseCase } from "../ports/app-user.use-case.definition";
import { AppUserUseCase } from "../use-cases/app-user.use-case";
import {
  FirestoreCollection,
  createFirestoreCollection,
} from "@common/firebase/utils";
import { FirestoreAppUser } from "../infrastructure/firestore/entities/app-user.firestore";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let appUserRepository: IAppUserRepository;
let appUserUseCase: IAppUserUseCase;
let appUserCollection: FirestoreCollection<FirestoreAppUser>;

export const myAppUserFactory = (firestore?: Firestore) => {
  myLogger.info("calling appUserFactory");

  if (firestore !== undefined && appUserRepository === undefined) {
    myLogger.info("creating appUserRepository");
    appUserCollection = createFirestoreCollection<FirestoreAppUser>(
      firestore,
      "app-users"
    );
    appUserRepository = new AppUserRepository(appUserCollection);
    myLogger.info("appUserRepository created");
  }

  if (appUserUseCase === undefined) {
    myLogger.info("creating appUserUseCase");
    appUserUseCase = new AppUserUseCase(appUserRepository);
    myLogger.info("appUserUseCase created");
  }

  return {
    appUserRepository,
    appUserUseCase,
    appUserCollection,
  };
};
