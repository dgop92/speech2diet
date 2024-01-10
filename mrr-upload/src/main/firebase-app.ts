import { AppLogger } from "@common/logging/logger";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { App } from "firebase-admin/app";
import { initializeApp, cert } from "firebase-admin/app";
import { getAppSecret } from "@common/config/secrets-vars";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

let authFirebaseClient: Auth;
let fireStoreClient: Firestore;
let firebaseApp: App;

// now we fetch the credentials content from the environment variable
// see: https://stackoverflow.com/a/48834975
export async function getFirebaseApp() {
  myLogger.info("trying to get firebase app");
  if (!firebaseApp) {
    const credensContent = await getAppSecret(
      "GOOGLE_APPLICATION_CREDENTIALS_CONTENT"
    );
    firebaseApp = initializeApp({
      credential: cert(JSON.parse(credensContent)),
    });
    myLogger.info("firebase app created");
  }
  myLogger.info("firebase app returned");
  return firebaseApp;
}

export function getAuthFirebaseClient(app: App) {
  myLogger.info("trying to get auth firebase client");
  if (!authFirebaseClient) {
    authFirebaseClient = getAuth(app);
    myLogger.info("auth firebase client created");
  }
  myLogger.info("auth firebase client returned");
  return authFirebaseClient;
}

export function getFirestoreClient(app: App) {
  myLogger.info("trying to get firestore client");
  if (!fireStoreClient) {
    fireStoreClient = getFirestore(app);
    myLogger.info("firestore client created");
  }
  myLogger.info("firestore client returned");
  return fireStoreClient;
}
