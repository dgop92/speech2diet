import { getAuth } from "firebase-admin/auth";
import { initializeApp, cert } from "firebase-admin/app";
import axios from "axios";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || "";

function createUrl(useEmulator: boolean, apiKey: string) {
  if (useEmulator) {
    return `http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
  } else {
    return `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
  }
}

const createIdTokenfromCustomToken = async (
  customToken: string,
  url: string
) => {
  try {
    const res = await axios({
      url: url,
      method: "post",
      data: {
        token: customToken,
        returnSecureToken: true,
      },
    });

    return res.data.idToken as string;
  } catch (e) {
    console.log(e);
  }
};

async function genAuthToken(): Promise<void> {
  console.log("initializing firebase app");
  const firebaseApp = initializeApp({
    credential: cert(
      JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_CONTENT || "{}")
    ),
  });
  const authFirebaseClient = getAuth(firebaseApp);

  const myArgs = process.argv.slice(2);
  const uuid: string | undefined = myArgs[0];
  const useEmulator: boolean = myArgs[1] === "true";

  if (!uuid) {
    console.log("Please provide a uuid as the first argument.");
    return;
  }

  if (FIREBASE_API_KEY === "") {
    console.log(
      "Please provide a FIREBASE_API_KEY as an environment variable."
    );
    return;
  }

  const token = await authFirebaseClient.createCustomToken(uuid);
  const url = createUrl(useEmulator, FIREBASE_API_KEY);
  const idToken = await createIdTokenfromCustomToken(token, url);

  console.log(idToken);
}

genAuthToken();
