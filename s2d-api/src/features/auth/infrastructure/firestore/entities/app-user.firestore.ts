import { AppUser } from "@features/auth/entities/app-user";

// id is not required because we can retrieve it from the document identifier
export type FirestoreAppUser = Omit<AppUser, "userId">;
