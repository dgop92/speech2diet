import { AuthModule } from "@features/auth/infrastructure/nest/auth.module";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, RouterModule } from "@nestjs/core";
import { AllExceptionsFilter } from "main/nest/general-exception-filter";
import { LoggerMiddleware } from "main/nest/logger-middleware";
import { TestUtilControllerV1 } from "./test-utils.controller";

@Module({
  imports: [
    AuthModule,
    RouterModule.register([
      {
        path: "auth",
        module: AuthModule,
      },
    ]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [TestUtilControllerV1],
})
export class TestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
