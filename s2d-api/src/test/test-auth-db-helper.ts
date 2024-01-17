import { Auth } from "firebase-admin/auth";
import {
  getTestFirebaseApp,
  getTestAuthFirebaseClient,
} from "./test-firebase-app";
import axios from "axios";

export class TestAuthDBHelper {
  private static _instance: TestAuthDBHelper;

  private constructor() {}

  public static get instance(): TestAuthDBHelper {
    if (!this._instance) this._instance = new TestAuthDBHelper();

    return this._instance;
  }

  public authFirebaseClient!: Auth;

  async setupTestAuthDB() {
    console.log("setupTestDB");
    const firebaseApp = getTestFirebaseApp();
    this.authFirebaseClient = getTestAuthFirebaseClient(firebaseApp);
  }

  async teardownTestAuthDB() {
    console.log("teardownTestAuthDB");
    // with firebase, we don't need to teardown the db
  }

  async deleteAllUsers() {
    // NOTE: the max number of users that can be deleted in one call is 1000
    // but as we are in a test environment, we don't need to worry about that
    const allUsers = await this.authFirebaseClient.listUsers();
    await Promise.all(
      allUsers.users.map((user) => this.authFirebaseClient.deleteUser(user.uid))
    );
  }

  async getAuthTokenForUser(uuid: string) {
    const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";

    if (FIREBASE_API_KEY === "") {
      throw new Error("FIREBASE_API_KEY is not set");
    }
    const useEmulator = !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

    let url;

    if (useEmulator) {
      url = `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
    } else {
      url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`;
    }

    const customToken = await this.authFirebaseClient.createCustomToken(uuid);
    const res = await axios({
      url: url,
      method: "post",
      data: {
        token: customToken,
        returnSecureToken: true,
      },
    });

    return res.data.idToken as string;
  }
}
