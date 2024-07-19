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
npm install -g firebase-tools
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

Run unit tests with:

```bash
npm run test
```

### Dev Environment

Run the dev server with:

```bash
npm run dev:server
```

Run the dev server with NestJS with:

```bash
npm run dev:nest-server
```

Running with Nest is mandatory for the [Swagger Nest JS plugin](https://docs.nestjs.com/openapi/cli-plugin) to take effect. Without this plugin, the API specification would be incomplete because of issues with the TypeScript metadata reflection system.

### Utilities Scripts

**Schema generation**

To generate the typescript types from the Joi schemas, execute the following command:

```bash
npm run schema-types <feature-name>
```

Example 1: Generate the types for the `foodlog` feature

```bash
npm run schema-types foodlog
```

**ID Token**

To create an ID token for firebase authentication you can use:

```bash
npm run test:id-token <appUserId> <useEmulator>
```

or, if you want to use the dev environment:

```bash
npm run dev:id-token <appUserId> <useEmulator>
```

Example 1: Test environment and using the emulator

```bash
npm run test:id-token uSsg1DYDQSPIdDLLSL35tvp12qg2 true
```

Example 2: Dev environment and using the real firebase authentication service

```bash
npm run dev:id-token uSsg1DYDQSPIdDLLSL35tvp12qg2
```

**API Docs**

To generate a JSON OpenAPI specification file, run:

```bash
npm run generate:api-docs
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
