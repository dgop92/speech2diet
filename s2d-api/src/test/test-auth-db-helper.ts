import { Auth } from "firebase-admin/auth";
import {
  getTestFirebaseApp,
  getTestAuthFirebaseClient,
} from "./test-firebase-app";

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
}
