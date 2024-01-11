import { Firestore } from "firebase-admin/firestore";
import {
  getTestFirebaseApp,
  getTestFirestoreClient,
} from "./test-firebase-app";
import { FirestoreCollection } from "@common/firebase/utils";

export class TestDBHelper {
  private static _instance: TestDBHelper;

  private constructor() {}

  public static get instance(): TestDBHelper {
    if (!this._instance) this._instance = new TestDBHelper();

    return this._instance;
  }

  public firestoreClient!: Firestore;

  async setupTestDB() {
    console.log("setupTestDB");
    const firebaseApp = getTestFirebaseApp();
    this.firestoreClient = getTestFirestoreClient(firebaseApp);
  }

  async teardownTestDB() {
    console.log("teardownTestDB");
    // with firestore, we don't need to do anything
  }

  async clear() {
    throw new Error("Firebase does not support clearing the database");
  }

  async clearCollection<T>(collection: FirestoreCollection<T>) {
    const documents = await collection.get();
    const promises = documents.docs.map((doc) => doc.ref.delete());
    await Promise.all(promises);
  }
}
