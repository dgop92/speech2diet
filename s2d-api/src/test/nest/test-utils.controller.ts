import { APP_ENV_VARS } from "@common/config/app-env-vars";
import { AppLogger } from "@common/logging/logger";
import { myAuthUserFactory } from "@features/auth/factories/auth-user.factory";
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from "@nestjs/common";
import { setupAuthModuleData } from "test/setup-data/auth.setup-data";

// THIS CONTROLLER IS ONLY USED IN TEST OR DEV ENVIRONMENTS

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

type SetupDataBody = {
  moduleToSetup: string;
};

@Controller({
  path: "test-util",
  version: "1",
})
export class TestUtilControllerV1 {
  @Post("/clear-all")
  async clearDatabaseAndServices() {
    if (!APP_ENV_VARS.isProduction) {
      myLogger.debug("deleting database");
      // await TestDBHelper.instance.clear();
      myLogger.debug("database deleted");
      myLogger.debug("deleting auth users");
      const { authUserRepository } = myAuthUserFactory();
      await authUserRepository.deleteAll();
      myLogger.debug("auth users deleted");
      return { clearSuccessful: true };
    }
    throw new HttpException(
      {
        error: "This endpoint is only available in non-production environments",
      },
      HttpStatus.UNAUTHORIZED
    );
  }

  @Post("/setup-data")
  async setupData(@Body() body: SetupDataBody) {
    if (!APP_ENV_VARS.isProduction) {
      myLogger.debug("setting up data", body);
      let result;
      const { moduleToSetup } = body;
      switch (moduleToSetup) {
        case "auth":
          result = await setupAuthModuleData();
          break;
        default:
          throw new HttpException(
            {
              error: "Invalid module name, valid values are: auth",
            },
            HttpStatus.BAD_REQUEST
          );
      }
      myLogger.debug("data setup done");
      return result;
    }
    throw new HttpException(
      {
        error: "This endpoint is only available in non-production environments",
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}
