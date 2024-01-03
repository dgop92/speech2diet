# Meal Report Review Upload Service

This service is responsible for uploading the meal report review to the database by consuming the messages from the nutrition response queue

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

### Environment variables

Remember to create the necessary environment variables located in the folder `env-vars/`
You can use the .example files as a template.

## How to run

### Consumers

Run the test consumer with:

```bash
npm run test:consumer
```

Run the dev consumer with:

```bash
npm run dev:consumer
```

The only difference between the commands are the environment variables used.

### Lambda

The project can be deployed as a lambda function. Use the `Dockerfile.lambda` file to build the image and run it locally.

To deploy the lambda function, use the following command:

```bash
docker build -f Dockerfile.lambda -t mrr-upload .
docker run --env-file <your-env-file> mrr-upload
```

## Optional - Doppler for secrets management

This project can use Doppler for secrets management. First, setup the project and environment using the following command:

```bash
doppler setup --project <project-name> --config dev
```

Download the secrets using the following command:

```bash
doppler secrets download --no-file --format=env-no-quotes > env-vars/.dev.env
```

Make sure the encoding of the file is UTF-8. dotenv will not work with UTF-16.
