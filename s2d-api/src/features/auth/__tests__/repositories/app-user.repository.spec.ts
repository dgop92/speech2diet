import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";

import { ErrorCode, RepositoryError } from "@common/errors";
import { AppUserRepository } from "@features/auth/infrastructure/firestore/repositories/app-user.repository";
import { AppUser } from "@features/auth/entities/app-user";
import { TEST_APP_USERS, TEST_USERS } from "../test-utils/users-test-data";
import {
  deleteAllDocumentsFromCollection,
  RANDOM_USER_ID,
} from "../test-utils/firebase-test-helpers";
import {
  getTestFirebaseApp,
  getTestFirestoreClient,
} from "tests/test-firebase-app";
import {
  createFirestoreCollection,
  FirestoreCollection,
} from "@common/firebase/utils";
import { FirestoreAppUser } from "@features/auth/infrastructure/firestore/entities/app-user.firestore";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

// Note userId is mock in order to not use firebase auth

describe("app user repository", () => {
  let appUserRepository: AppUserRepository;
  let collection: FirestoreCollection<FirestoreAppUser>;

  beforeAll(async () => {
    const app = getTestFirebaseApp();
    const firestoreClient = getTestFirestoreClient(app);
    collection = createFirestoreCollection<FirestoreAppUser>(
      firestoreClient,
      "app-users"
    );
    appUserRepository = new AppUserRepository(collection);
  });

  afterAll(async () => {
    await deleteAllDocumentsFromCollection(collection);
  });

  describe("Create", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await deleteAllDocumentsFromCollection(collection);
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should create an app user", async () => {
      const inputData = TEST_APP_USERS.appUserTest2;
      const appUser = await appUserRepository.create(inputData);
      expect(appUser).toMatchObject(TEST_APP_USERS.appUserTest2);

      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { userId: TEST_USERS.authUserTest2.id },
      });
      expect(appUserRetrieved).toBeDefined();
    });
    it("should throw error if userId is already in use", async () => {
      const inputData = {
        firstName: "Pedroski",
        lastName: "Tomski",
        userId: TEST_USERS.authUserTest1.id,
      };
      try {
        await appUserRepository.create(inputData);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.errorParams.fieldName).toBe("userId");
        }
      }
    });
  });

  describe("Get One By", () => {
    let appUser1: AppUser;

    beforeAll(async () => {
      await deleteAllDocumentsFromCollection(collection);
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should get an app user by userId", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { userId: TEST_APP_USERS.appUserTest1.userId },
      });
      expect(appUserRetrieved).toBeDefined();
      expect(appUserRetrieved?.userId).toBe(appUser1.userId);
    });
    it("should not get an app user by userId", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { userId: RANDOM_USER_ID },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
    it("should get an app user by id", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { id: appUser1.id },
      });
      expect(appUserRetrieved).toBeDefined();
      expect(appUserRetrieved?.userId).toBe(appUser1.userId);
    });
    it("should not get an app user by id", async () => {
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { id: "blablabla" },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
  });

  describe("Update", () => {
    let appUser1: AppUser;

    beforeAll(async () => {
      await deleteAllDocumentsFromCollection(collection);
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should update an app user", async () => {
      const appUserUpdated = await appUserRepository.update(appUser1, {
        firstName: "Jonas",
        lastName: "Jonaitis",
      });
      expect(appUserUpdated.firstName).toBe("Jonas");
      expect(appUserUpdated.lastName).toBe("Jonaitis");
    });
  });

  describe("Delete", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await deleteAllDocumentsFromCollection(collection);
      appUser1 = await appUserRepository.create(TEST_APP_USERS.appUserTest1);
    });

    it("should delete an app user", async () => {
      await appUserRepository.delete(appUser1);
      const appUserRetrieved = await appUserRepository.getOneBy({
        searchBy: { id: appUser1.id },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
  });
});
