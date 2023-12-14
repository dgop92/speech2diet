import { AppLogger } from "@common/logging/logger";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { App } from "firebase-admin/app";
import { initializeApp, cert } from "firebase-admin/app";
import { APP_ENV_VARS } from "@common/config/app-env-vars";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let authFirebaseClient: Auth;
let fireStoreClient: Firestore;
let firebaseApp: App;

export function getTestFirebaseApp() {
  myLogger.info("trying to get firebase app");
  if (!firebaseApp) {
    firebaseApp = initializeApp({
      credential: cert(JSON.parse(APP_ENV_VARS.firebase.credentialsContent)),
    });
    myLogger.info("firebase app created");
  }
  myLogger.info("firebase app returned");
  return firebaseApp;
}

export function getTestAuthFirebaseClient(app: App) {
  myLogger.info("trying to get auth firebase client");
  if (!authFirebaseClient) {
    authFirebaseClient = getAuth(app);
    myLogger.info("auth firebase client created");
  }
  myLogger.info("auth firebase client returned");
  return authFirebaseClient;
}

export function getTestFirestoreClient(app: App) {
  myLogger.info("trying to get firestore client");
  if (!fireStoreClient) {
    fireStoreClient = getFirestore(app);
    myLogger.info("firestore client created");
  }
  myLogger.info("firestore client returned");
  return fireStoreClient;
}
