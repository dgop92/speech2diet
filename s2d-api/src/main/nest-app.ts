import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { INestApplication, VersioningType } from "@nestjs/common";
import { AppModule } from "./nest/app.module";
import { AllExceptionsFilter } from "./nest/general-exception-filter";
import { setupFactories } from "./setup-factories";
import { APP_ENV_VARS } from "@common/config/app-env-vars";
import {
  getAuthFirebaseClient,
  getFirebaseApp,
  getFirestoreClient,
} from "./firebase-app";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";

export async function initializeFactories() {
  const firebaseApp = await getFirebaseApp();
  const authFirebaseClient = getAuthFirebaseClient(firebaseApp);
  const firestoreClient = getFirestoreClient(firebaseApp);

  setupFactories(authFirebaseClient, firestoreClient);
}

export async function createNestApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
  app.setGlobalPrefix("api");
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
  app.enableCors({
    origin: APP_ENV_VARS.cors.allowOrigins,
  });
  return app;
}

export function createSwaggerDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle("Speech 2 Diet API")
    .setDescription("The Speech 2 Diet API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  return document;
}
