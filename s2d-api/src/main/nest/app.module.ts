import { AuthModule } from "@features/auth/infrastructure/nest/auth.module";
import { MiddlewareConsumer, Module, RequestMethod } from "@nestjs/common";
import { APP_FILTER, RouterModule } from "@nestjs/core";
import { AllExceptionsFilter } from "./general-exception-filter";
import { LoggerMiddleware } from "./logger-middleware";
import { FoodLogModule } from "@features/foodlog/infrastructure/nest/foodlog.module";
import { HealthController } from "./health.controller";
import { ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    AuthModule,
    FoodLogModule,
    RouterModule.register([
      {
        path: "auth",
        module: AuthModule,
      },
      {
        path: "foodlog",
        module: FoodLogModule,
      },
    ]),
    // Generic configuration, make sure to override it in the specific endpoints
    ThrottlerModule.forRoot([{ ttl: 1000, limit: 10 }]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [HealthController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
