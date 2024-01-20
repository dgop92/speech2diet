# Meal Report Review Upload Service

This service is responsible for uploading the meal report review to the corresponding service owner of the app's core db, in this case s2d-api.

## Setup

It is recommended to run the project in node 16.15.0 or greater.

### Dependencies

Install the project dependencies with:

```bash
npm install
```

### Environment variables and secrets

Remember to create the necessary environment variables located in the folder `env-vars/`
You can use the .example files as a template.

In the env.examples, some variables are marked as secrets. These variables can be extracted from aws parameter store or env vars. You can define what to use, by setting the `SECRETS_FROM` env var to `ssm` or `env`.

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
