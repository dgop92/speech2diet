import { AppLogger } from "@common/logging/logger";
import {
  createTestLogger,
  WinstonLogger,
} from "@common/logging/winston-logger";
import { AppUser } from "@features/auth/entities/app-user";
import {
  RANDOM_USER_ID,
  TEST_APP_USERS,
  TEST_USERS,
} from "../test-utils/users-test-data";
import { AppUserUseCase } from "@features/auth/use-cases/app-user.use-case";
import { ApplicationError, ErrorCode, InvalidInputError } from "@common/errors";
import { myAppUserFactory } from "@features/auth/factories/app-user.factory";
import { IAppUserUseCase } from "@features/auth/ports/app-user.use-case.definition";
import { TestDBHelper } from "test/test-db-helper";
import { IAppUserRepository } from "@features/auth/ports/app-user.repository.definition";

const logger = createTestLogger();
const winstonLogger = new WinstonLogger(logger);
AppLogger.getAppLogger().setLogger(winstonLogger);

describe("app user use-case", () => {
  let appUserUseCase: IAppUserUseCase;
  let deleteAllRecords: () => Promise<void>;

  beforeAll(async () => {
    await TestDBHelper.instance.setupTestDB();
    const appUserFactory = myAppUserFactory(
      TestDBHelper.instance.firestoreClient
    );
    const appUserRepository = appUserFactory.appUserRepository;
    deleteAllRecords = () =>
      TestDBHelper.instance.clearCollection(appUserFactory.appUserCollection);

    appUserUseCase = new AppUserUseCase(appUserRepository);
  });

  afterAll(async () => {
    await deleteAllRecords();
  });

  describe("Create", () => {
    beforeEach(async () => {
      await deleteAllRecords();
    });

    it("should create an app user", async () => {
      const inputData = TEST_APP_USERS.appUserTest2;
      const appUser = await appUserUseCase.create({ data: inputData });
      expect(appUser).toMatchObject(TEST_APP_USERS.appUserTest2);

      const appUserRetrieved = await appUserUseCase.getOneBy({
        searchBy: { userId: TEST_USERS.authUserTest2.id },
      });
      expect(appUserRetrieved).toBeDefined();
    });
  });

  describe("Update", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await deleteAllRecords();
      appUser1 = await appUserUseCase.create({
        data: TEST_APP_USERS.appUserTest1,
      });
    });

    it("should update an app user", async () => {
      const inputData = {
        firstName: "Pedroski",
        lastName: "Tomski",
      };
      const appUserUpdated = await appUserUseCase.update({
        searchBy: { id: appUser1.id },
        data: inputData,
      });
      expect(appUserUpdated).toMatchObject(inputData);
    });
    it("should throw an error if app user is not found", async () => {
      try {
        await appUserUseCase.update({
          searchBy: { id: "blabla" },
          data: {},
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Delete", () => {
    let appUser1: AppUser;

    beforeEach(async () => {
      await deleteAllRecords();
      appUser1 = await appUserUseCase.create({
        data: TEST_APP_USERS.appUserTest1,
      });
    });

    it("should delete an app user", async () => {
      await appUserUseCase.delete({
        searchBy: { id: appUser1.id },
      });
      const appUserRetrieved = await appUserUseCase.getOneBy({
        searchBy: { id: appUser1.id },
      });
      expect(appUserRetrieved).toBeUndefined();
    });
    it("should throw an error if app user is not found", async () => {
      try {
        await appUserUseCase.delete({ searchBy: { id: "blabla" } });
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationError);
        if (error instanceof ApplicationError) {
          expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
        }
      }
    });
  });

  describe("Get One By", () => {
    let appUser1: AppUser;

    beforeAll(async () => {
      await deleteAllRecords();
      appUser1 = await appUserUseCase.create({
        data: TEST_APP_USERS.appUserTest1,
      });
    });

    // positive test cases
    it("should get an app user by id", async () => {
      const appUser = await appUserUseCase.getOneBy({
        searchBy: { id: appUser1.id },
      });
      expect(appUser).toBeDefined();
      expect(appUser?.id).toBe(appUser1.id);
    });
    it("should get an app user by user id", async () => {
      const appUser = await appUserUseCase.getOneBy({
        searchBy: { userId: appUser1.userId },
      });
      expect(appUser).toBeDefined();
      expect(appUser?.userId).toBe(appUser1.userId);
    });
    it("should not get an app user by id", async () => {
      const appUser = await appUserUseCase.getOneBy({
        searchBy: { id: "blabla" },
      });
      expect(appUser).toBeUndefined();
    });
    it("should not get an app user by user id", async () => {
      const appUser = await appUserUseCase.getOneBy({
        searchBy: { userId: RANDOM_USER_ID },
      });
      expect(appUser).toBeUndefined();
    });
  });
});

describe("app users use-case invalid input", () => {
  let appUserUseCase: IAppUserUseCase;

  beforeAll(async () => {
    appUserUseCase = new AppUserUseCase(undefined!);
  });

  describe("Create Invalid Input", () => {
    it("should throw an error if first name has more than 120 characters", async () => {
      try {
        await appUserUseCase.create({
          data: {
            firstName: Array(130).join("x"),
            lastName: "Tom",
            userId: RANDOM_USER_ID,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("firstName");
        }
      }
    });
    it("should throw an error if last name has more than 120 characters", async () => {
      try {
        await appUserUseCase.create({
          data: {
            firstName: "Tom",
            lastName: Array(130).join("x"),
            userId: RANDOM_USER_ID,
          },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("lastName");
        }
      }
    });
    it("should throw an error if userId is invalid", async () => {
      try {
        await appUserUseCase.create({
          data: {
            firstName: "Tom",
            lastName: "Tom",
            userId: 123,
          },
        } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("userId");
        }
      }
    });
  });

  describe("Update Invalid Input", () => {
    it("should throw an error if first name has more than 120 characters", async () => {
      try {
        await appUserUseCase.update({
          data: {
            firstName: Array(130).join("x"),
            lastName: "Tom",
          },
          searchBy: { id: "1" },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("firstName");
        }
      }
    });
    it("should throw an error if last name has more than 120 characters", async () => {
      try {
        await appUserUseCase.update({
          data: {
            firstName: "Tom",
            lastName: Array(130).join("x"),
          },
          searchBy: { id: "1" },
        });
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("lastName");
        }
      }
    });
  });

  describe("Get One By Invalid Input", () => {
    it("should throw an error if userId is invalid", async () => {
      try {
        await appUserUseCase.getOneBy({
          searchBy: {
            userId: 123,
          },
        } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("userId");
        }
      }
    });
  });

  describe("Delete Invalid Input", () => {
    it("should throw an error if id is invalid", async () => {
      try {
        await appUserUseCase.delete({
          searchBy: {
            id: 1234,
          },
        } as any);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidInputError);
        if (error instanceof InvalidInputError) {
          expect(error.errorParams.fieldName).toBe("id");
        }
      }
    });
  });
});
