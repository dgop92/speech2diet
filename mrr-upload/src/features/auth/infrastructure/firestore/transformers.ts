import { FirestoreAppUser } from "./entities/app-user.firestore";
import { AppUser } from "@features/auth/entities/app-user";
import { Timestamp } from "firebase-admin/firestore";

export function firestoreAppUserToDomain(
  firestoreAppUser: FirestoreAppUser
): AppUser {
  return {
    id: firestoreAppUser.id,
    userId: firestoreAppUser.id,
    firstName: firestoreAppUser.firstName,
    lastName: firestoreAppUser.lastName,
    healthData: firestoreAppUser.healthData,
    createdAt: firestoreAppUser.createdAt.toDate(),
    updatedAt: firestoreAppUser.updatedAt.toDate(),
    deletedAt: firestoreAppUser.deletedAt?.toDate() ?? null,
  };
}

export function firestoreAppUserFromDomain(appUser: AppUser): FirestoreAppUser {
  return {
    id: appUser.id,
    firstName: appUser.firstName,
    lastName: appUser.lastName,
    healthData: appUser.healthData,
    createdAt: Timestamp.fromDate(appUser.createdAt),
    updatedAt: Timestamp.fromDate(appUser.updatedAt),
    deletedAt: appUser.deletedAt && Timestamp.fromDate(appUser.deletedAt),
  };
}
