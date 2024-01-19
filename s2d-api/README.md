# Speech 2 Diet API

The API for the Speech 2 Diet project.

## Setup

It is recommended to run the project in node 16.15.0 or greater.

### Dependencies

Install the project dependencies with:

```bash
npm install
```

If you want to use the Firebase emulator, consider the following steps:

1. Install the Firebase CLI with:

```bash
npm install -g firebase-tools@12.4.3
```

2. Login to Firebase with:

```bash
firebase login
```

3. Create a project in Firebase using the Firebase console.

4. Now, create a `.firebaserc` file in the root of the project with the following content:

```json
{
  "projects": {
    "default": "<project-name>"
  }
}
```

To avoid any issues, it is recommended that the name of the project is the same as the one mentioned in the Google credentials environment variable.

Remember if you use the emulators the data is reset every time you restart the emulators.

### Environment variables and secrets

Remember to create the necessary environment variables located in the folder `env-vars/`
You can use the .example files as a template.

In the env.examples, some variables are marked as secrets. These variables can be extracted from aws parameter store or env vars. You can define what to use setting the `SECRETS_FROM` env var to `ssm` or `env`.

## How to run

### Test Environment

Before running the project you need to run the firebase emulators

```bash
firebase emulators:start
```

Run the test server with:

```bash
npm run test:server
```

The test environment has the following characteristics:

- Data is reset each time emulators are restarted
- There are some especial endpoints for testing purposes, such as an endpoint to setup dummy data. http file with the requests is in `endpoint-examples/test-utilities.http`
- You can create auth tokens using `npm run test:id-token <appUserId> true`

### Dev Environment

Run the dev server with:

```bash
npm run dev:server
```

## Optional - Doppler for env vars management

This project can use Doppler for env vars management. First, setup the project and environment using the following command:

```bash
doppler setup --project <project-name> --config <env-name>
```

Download the env vars using the following command:

```bash
doppler secrets download --no-file --format=env-no-quotes > env-vars/.<env-name>.env
```

Make sure the encoding of the file is UTF-8. dotenv will not work with UTF-16.
