import { AppLogger } from "@common/logging/logger";
import { ErrorCode, RepositoryError } from "@common/errors";

import { FirestoreCollection } from "@common/firebase/utils";
import {
  AppUserCreateRepoData,
  AppUserUpdateRepoData,
  HealthDataUpdateRepoData,
  IAppUserRepository,
} from "@features/auth/ports/app-user.repository.definition";
import { FirestoreAppUser } from "../entities/app-user.firestore";
import { AppUser } from "@features/auth/entities/app-user";
import { AppUserSearchInput } from "@features/auth/schema-types";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

function shouldThrowTransactionError(transactionManager: any) {
  if (transactionManager) {
    throw new RepositoryError(
      "transactions are not supported for this implementation",
      ErrorCode.NOT_IMPLEMENTED
    );
  }
}

export class AppUserRepository implements IAppUserRepository {
  constructor(
    private readonly collection: FirestoreCollection<FirestoreAppUser>
  ) {}

  create(input: AppUserCreateRepoData): Promise<AppUser>;
  create<T>(
    input: AppUserCreateRepoData,
    transactionManager?: T | undefined
  ): Promise<AppUser>;
  async create(
    input: AppUserCreateRepoData,
    transactionManager?: any
  ): Promise<AppUser> {
    myLogger.debug("creating app user", { userId: input.userId });

    shouldThrowTransactionError(transactionManager);

    const appUserData: FirestoreAppUser = {
      // just to satisfy the interface
      id: input.userId,
      firstName: input.firstName,
      lastName: input.lastName,
      healthData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    try {
      await this.collection.doc(input.userId).create(appUserData);
    } catch (error) {
      //  auth user already have an app user
      if (error.code === "already-exists") {
        throw new RepositoryError(
          "auth user already have an app user",
          ErrorCode.DUPLICATED_RECORD
        );
      }
    }

    myLogger.debug("app user created", { userId: input.userId });
    return {
      userId: input.userId,
      ...appUserData,
    };
  }

  update(appUser: AppUser, input: AppUserUpdateRepoData): Promise<AppUser>;
  update<T>(
    appUser: AppUser,
    input: AppUserUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<AppUser>;
  async update(
    appUser: AppUser,
    input: AppUserUpdateRepoData,
    transactionManager?: any
  ): Promise<AppUser> {
    myLogger.debug("updating app user", { id: appUser.id });

    shouldThrowTransactionError(transactionManager);

    const { userId, ...oldData } = appUser;

    const appUserUpdated: FirestoreAppUser = {
      ...oldData,
      ...input,
      updatedAt: new Date(),
    };

    try {
      await this.collection.doc(userId).update(appUserUpdated);
    } catch (error) {
      if (error.code === "not-found") {
        throw new RepositoryError("app user not found", ErrorCode.NOT_FOUND);
      }
    }

    myLogger.debug("app user updated", { id: appUser.id });
    return {
      ...appUser,
      // this will override the old data with the new fields
      ...appUserUpdated,
    };
  }

  updateHealthData(
    appUser: AppUser,
    input: HealthDataUpdateRepoData
  ): Promise<AppUser>;
  updateHealthData<T>(
    appUser: AppUser,
    input: HealthDataUpdateRepoData,
    transactionManager?: T | undefined
  ): Promise<AppUser>;
  async updateHealthData(
    appUser: AppUser,
    input: HealthDataUpdateRepoData,
    transactionManager?: any
  ): Promise<AppUser> {
    myLogger.debug("updating app user health data", { id: appUser.id });

    shouldThrowTransactionError(transactionManager);

    const { userId, ...oldData } = appUser;

    const oldHealthData = oldData.healthData ?? {};
    const newHealthData = {
      ...oldHealthData,
      ...input,
    };

    const appUserUpdated: FirestoreAppUser = {
      ...oldData,
      healthData: newHealthData,
      updatedAt: new Date(),
    };

    try {
      await this.collection.doc(userId).update(appUserUpdated);
    } catch (error) {
      if (error.code === "not-found") {
        throw new RepositoryError("app user not found", ErrorCode.NOT_FOUND);
      }
    }

    myLogger.debug("app user health data updated", { id: appUser.id });
    return {
      ...appUser,
      // this will override the old data with the new fields
      ...appUserUpdated,
    };
  }

  delete(appUser: AppUser): Promise<void>;
  delete<T>(
    appUser: AppUser,
    transactionManager?: T | undefined
  ): Promise<void>;
  async delete(appUser: AppUser, transactionManager?: any): Promise<void> {
    myLogger.debug("deleting app user", { id: appUser.id });

    shouldThrowTransactionError(transactionManager);

    try {
      await this.collection.doc(appUser.id).delete();
    } catch (error) {
      if (error.code === "not-found") {
        throw new RepositoryError("app user not found", ErrorCode.NOT_FOUND);
      }
    }

    myLogger.debug("app user deleted", { id: appUser.id });
  }

  getOneBy(input: AppUserSearchInput): Promise<AppUser | undefined>;
  getOneBy<T>(
    input: AppUserSearchInput,
    transactionManager?: T | undefined
  ): Promise<AppUser | undefined>;
  async getOneBy(
    input: AppUserSearchInput,
    transactionManager?: any
  ): Promise<AppUser | undefined> {
    myLogger.debug("getting app user by", {
      userId: input.searchBy?.userId,
      id: input.searchBy?.id,
    });

    if (
      input.searchBy?.userId !== undefined &&
      input.searchBy?.id !== undefined
    ) {
      throw new RepositoryError(
        "You can only search by userId or id, not both",
        ErrorCode.INVALID_OPERATION
      );
    }

    shouldThrowTransactionError(transactionManager);

    if (input.searchBy?.userId) {
      const appUser = await this.collection.doc(input.searchBy.userId).get();

      if (appUser.exists) {
        myLogger.debug("app user found", { userId: input.searchBy.userId });
        const appUserData = appUser.data()!;
        return {
          userId: input.searchBy.userId,
          ...appUserData,
        };
      }
    }

    if (input.searchBy?.id) {
      const appUser = await this.collection
        .where("id", "==", input.searchBy.id)
        .get();

      if (appUser.docs.length <= 0) {
        return undefined;
      }

      if (appUser.docs.length > 1) {
        throw new RepositoryError(
          "More than one app user found",
          ErrorCode.APPLICATION_INTEGRITY_ERROR
        );
      }

      myLogger.debug("app user found", { id: input.searchBy.id });
      const appUserData = appUser.docs[0].data();
      const userId = appUser.docs[0].id;

      return {
        userId: userId,
        ...appUserData,
      };
    }

    return undefined;
  }
}
