# Speech 2 Diet API

## Setup

It is recommended to run the project in node 16.15.0

### Install dependencies

```bash
npm install
```

For running the project in the test environment you need to install the firebase emulator

```bash
npm install -g firebase-tools@12.4.3
```

Then follow the firebase documentation to login and initialize the project to be able to use the firebase emulators. For this project we only need the:

- Firestore emulator
- Authentication emulator

Remember to create the necessary environment variables located in the folder `env-vars/`
You can use the .example files as a template.

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

## Optional - Doppler for secrets management

This project can use Doppler for secrets management. First, setup the project and environment using the following command:

```bash
doppler setup --project <project-name> --config dev
```

And finally we recommended the mounting or download methods to retrieve the secrets.

For example:

```bash
doppler secrets download --no-file --format env > env-vars/.dev.env
```
