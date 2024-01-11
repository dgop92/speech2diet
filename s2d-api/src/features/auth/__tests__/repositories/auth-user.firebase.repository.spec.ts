import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { AuthUser } from "@features/auth/entities/auth-user";

import { ErrorCode, RepositoryError } from "@common/errors";
import { RANDOM_USER_ID } from "../test-utils/users-test-data";
import { TEST_EMAILS } from "../test-utils/users-test-data";
import { TestAuthDBHelper } from "test/test-auth-db-helper";
import { myAuthUserFactory } from "@features/auth/factories/auth-user.factory";
import { IAuthUserRepository } from "@features/auth/ports/auth-user.repository.definition";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("firebase repository", () => {
  let authUserRepository: IAuthUserRepository;
  let authUser1: AuthUser;
  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestAuthDBHelper.instance.setupTestAuthDB();
    const authUserFactory = myAuthUserFactory(
      TestAuthDBHelper.instance.authFirebaseClient
    );
    authUserRepository = authUserFactory.authUserRepository;
    deleteAllRecords = () => TestAuthDBHelper.instance.deleteAllUsers();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllRecords();
      authUser1 = await authUserRepository.create({
        email: TEST_EMAILS.emailTest1,
        password: "secret-PASSWORD-1234",
      });
    });

    it("should create a user", async () => {
      const email = TEST_EMAILS.emailTest2;
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      const user = await authUserRepository.create(userData);
      expect(user.email).toBe(userData.email);

      const userRetrieved = await authUserRepository.getOneBy({
        searchBy: { email },
      });
      expect(userRetrieved).toBeDefined();
    });
    it("should throw an error if email is already taken", async () => {
      const email = TEST_EMAILS.emailTest1;
      const userData = {
        password: "secret-PASSWORD-1234",
        email,
      };
      try {
        await authUserRepository.create(userData);
      } catch (error) {
        expect(error).toBeInstanceOf(RepositoryError);
        if (error instanceof RepositoryError) {
          expect(error.errorCode).toBe(ErrorCode.DUPLICATED_RECORD);
          expect(error.errorParams.fieldName).toBe("email");
        }
      }
    });
  });

  describe("Get One By", () => {
    beforeAll(async () => {
      await deleteAllRecords();
      authUser1 = await authUserRepository.create({
        email: TEST_EMAILS.emailTest1,
        password: "secret-PASSWORD-1234",
      });
    });
    it("should get a user by id", async () => {
      const user = await authUserRepository.getOneBy({
        searchBy: { id: authUser1.id },
      });
      expect(user).toBeDefined();
      expect(user?.id).toBe(authUser1.id);
    });
    it("should not get a user by id", async () => {
      const user = await authUserRepository.getOneBy({
        searchBy: { id: RANDOM_USER_ID },
      });
      expect(user).toBeUndefined();
    });
    it("should get a user by email", async () => {
      const user = await authUserRepository.getOneBy({
        searchBy: { email: authUser1.email },
      });
      expect(user).toBeDefined();
      expect(user?.email).toBe(authUser1.email);
    });
    it("should not get a user by email", async () => {
      const user = await authUserRepository.getOneBy({
        searchBy: { email: TEST_EMAILS.emailTest4 },
      });
      expect(user).toBeUndefined();
    });
  });

  describe("Delete", () => {
    beforeEach(async () => {
      await deleteAllRecords();
      authUser1 = await authUserRepository.create({
        email: TEST_EMAILS.emailTest1,
        password: "secret-PASSWORD-1234",
      });
    });
    it("should delete an user", async () => {
      await authUserRepository.delete(authUser1);
      const user = await authUserRepository.getOneBy({
        searchBy: { id: authUser1.id },
      });
      expect(user).toBeUndefined();
    });
  });
});
