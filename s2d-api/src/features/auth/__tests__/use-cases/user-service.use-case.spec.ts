import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import {
  deleteAllDocumentsFromCollection,
  RANDOM_USER_ID,
} from "../test-utils/firebase-test-helpers";
import { TEST_APP_USERS, TEST_EMAILS } from "../test-utils/users-test-data";
import { ApplicationError, ErrorCode } from "@common/errors";
import { User } from "@features/auth/entities/user";
import { IUserServiceUseCase } from "@features/auth/ports/user-service.use-case.definition";
import { IAppUserUseCase } from "@features/auth/ports/app-user.use-case.definition";
import { IAuthUserUseCase } from "@features/auth/ports/auth-user.use-case.definition";
import { IAuthUserRepository } from "@features/auth/ports/auth-user.repository.definition";
import { myAuthUserFactory } from "@features/auth/factories/auth-user.factory";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { myUserServiceFactory } from "@features/auth/factories/user-service-factory";
import {
  createFirestoreCollection,
  FirestoreCollection,
} from "@common/firebase/utils";
import { FirestoreAppUser } from "@features/auth/infrastructure/firestore/entities/app-user.firestore";
import {
  getTestFirebaseApp,
  getTestFirestoreClient,
} from "test/test-firebase-app";
import { getAuthFirebaseClient } from "main/firebase-app";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("user service use-case", () => {
  let authUserUseCase: IAuthUserUseCase;
  let appUserUseCase: IAppUserUseCase;
  let userServiceUseCase: IUserServiceUseCase;
  let authUserRepository: IAuthUserRepository;
  let collection: FirestoreCollection<FirestoreAppUser>;

  beforeAll(async () => {
    const app = getTestFirebaseApp();
    const firestoreClient = getTestFirestoreClient(app);
    const authClient = getAuthFirebaseClient(app);

    const authUserFactory = myAuthUserFactory(authClient);
    authUserUseCase = authUserFactory.authUserUseCase;
    authUserRepository = authUserFactory.authUserRepository;
    collection = createFirestoreCollection<FirestoreAppUser>(
      firestoreClient,
      "app-users"
    );

    const appUserFactory = myAppUserFactory(firestoreClient);
    appUserUseCase = appUserFactory.appUserUseCase;

    const userServiceFactory = myUserServiceFactory(
      authUserUseCase,
      appUserUseCase
    );
    userServiceUseCase = userServiceFactory.userServiceUseCase;
  });

  describe("Create", () => {
    beforeEach(async () => {
      await authUserRepository.deleteAll();
      await deleteAllDocumentsFromCollection(collection);
      await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should create a user service", async () => {
      const user = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest2,
          password: "secret-PASSWORD-1234",
        },
        appUserData: TEST_APP_USERS.appUserTest2,
      });
      expect(user.authUser.email).toBe(TEST_EMAILS.emailTest2);
      expect(user.appUser.firstName).toBe(
        TEST_APP_USERS.appUserTest2.firstName
      );
      expect(user.appUser.lastName).toBe(TEST_APP_USERS.appUserTest2.lastName);
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: user.authUser.id },
      });
      expect(userServiceRetrieved).toBeDefined();
    });
    it("should throw an error if email is already in use", async () => {
      try {
        await userServiceUseCase.create({
          authUserData: {
            email: TEST_EMAILS.emailTest1,
            password: "secret-PASSWORD-1234",
          },
          appUserData: TEST_APP_USERS.appUserTest2,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });
    it("should link auth user to app user", async () => {
      await authUserUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
      });
      const user = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
        appUserData: TEST_APP_USERS.appUserTest2,
      });
      expect(user.authUser.email).toBe(TEST_EMAILS.emailTest3);
    });
  });

  describe("Get One By", () => {
    let user1: User;

    beforeAll(async () => {
      await authUserRepository.deleteAll();
      await deleteAllDocumentsFromCollection(collection);
      user1 = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should get a user", async () => {
      const userRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: user1.authUser.id },
      });
      expect(userRetrieved).toBeDefined();
      expect(userRetrieved?.authUser.id).toBe(user1.authUser.id);
    });
    it("should not get a user service", async () => {
      const userRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(userRetrieved).toBeUndefined();
    });
    it("should throw integrity error if one of the users are not found", async () => {
      const user = await authUserUseCase.create({
        data: {
          email: TEST_EMAILS.emailTest3,
          password: "secret-PASSWORD-1234",
        },
      });
      try {
        await userServiceUseCase.getOneByUserId({
          searchBy: { id: user.id },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.APPLICATION_INTEGRITY_ERROR);
        }
      }
    });
  });

  describe("Delete", () => {
    let user: User;

    beforeEach(async () => {
      await authUserRepository.deleteAll();
      await deleteAllDocumentsFromCollection(collection);
      user = await userServiceUseCase.create({
        authUserData: {
          email: TEST_EMAILS.emailTest1,
          password: "secret-PASSWORD-1234",
        },
        appUserData: {
          firstName: TEST_APP_USERS.appUserTest1.firstName,
          lastName: TEST_APP_USERS.appUserTest2.lastName,
        },
      });
    });

    it("should delete a user service", async () => {
      await userServiceUseCase.delete({
        searchBy: { id: user.authUser.id },
      });
      const userServiceRetrieved = await userServiceUseCase.getOneByUserId({
        searchBy: { id: user.authUser.id },
      });
      expect(userServiceRetrieved).toBeUndefined();
    });
    it("should throw an error if user service is not found", async () => {
      try {
        await userServiceUseCase.delete({
          searchBy: { id: RANDOM_USER_ID },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });
});
