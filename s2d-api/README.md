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
