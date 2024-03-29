import { AppUser } from "../entities/app-user";
import {
  AppUserCreateInput,
  AppUserSearchInput,
  AppUserUpdateInput,
  HealthDataUpdateInput,
} from "../schema-types";

export type AppUserCreateRepoData = AppUserCreateInput["data"];
export type AppUserUpdateRepoData = AppUserUpdateInput["data"];
export type HealthDataUpdateRepoData = HealthDataUpdateInput["data"];

export interface IAppUserRepository {
  create(input: AppUserCreateRepoData): Promise<AppUser>;
  create<T>(
    input: AppUserCreateRepoData,
    transactionManager?: T
  ): Promise<AppUser>;
  update(appUser: AppUser, input: AppUserUpdateRepoData): Promise<AppUser>;
  update<T>(
    appUser: AppUser,
    input: AppUserUpdateRepoData,
    transactionManager?: T
  ): Promise<AppUser>;
  updateHealthData(
    appUser: AppUser,
    input: HealthDataUpdateRepoData
  ): Promise<AppUser>;
  updateHealthData<T>(
    appUser: AppUser,
    input: HealthDataUpdateRepoData,
    transactionManager?: T
  ): Promise<AppUser>;
  getOneBy(input: AppUserSearchInput): Promise<AppUser | undefined>;
  getOneBy<T>(
    input: AppUserSearchInput,
    transactionManager?: T
  ): Promise<AppUser | undefined>;
  delete(appUser: AppUser): Promise<void>;
  delete<T>(appUser: AppUser, transactionManager?: T): Promise<void>;
}
