import { authFactory } from "@features/auth/factories";
import { foodlogFactory } from "@features/foodlog/factories";
import { Auth } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";

export function setupFactories(
  authFirebaseClient: Auth,
  fireStoreClient: Firestore
) {
  authFactory(authFirebaseClient, fireStoreClient);
  foodlogFactory(fireStoreClient);
}
