import { Auth } from "firebase-admin/auth";
import { Firestore } from "firebase-admin/firestore";
import { myAppUserFactory } from "./app-user.factory";
import { myAuthUserFactory } from "./auth-user.factory";
import { myUserServiceFactory } from "./user-service-factory";

export function authFactory(
  authFirebaseClient?: Auth,
  fireStoreClient?: Firestore
) {
  const authUserFactory = myAuthUserFactory(authFirebaseClient);
  const appUserFactory = myAppUserFactory(fireStoreClient);
  const userServiceFactory = myUserServiceFactory(
    authUserFactory.authUserUseCase,
    appUserFactory.appUserUseCase
  );
  return {
    authUserFactory,
    appUserFactory,
    userServiceFactory,
  };
}
