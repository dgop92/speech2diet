import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AppLogger } from "@common/logging/logger";
import { ErrorCode, PresentationError } from "@common/errors";
import { getAppSecret } from "@common/config/secrets-vars";

const myLogger = AppLogger.getAppLogger().createFileLogger(__filename);

@Injectable()
export class SimpleApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    myLogger.debug("checking if request has api key");

    const validApikey = await getAppSecret("MRR_UPLOAD_API_KEY");

    let apiKey: string | undefined = req.headers?.["X-API-KEY"];

    if (!apiKey) {
      apiKey = req.headers?.["x-api-key"];
    }

    if (!apiKey) {
      throw new PresentationError(
        "no api key was found",
        ErrorCode.UNAUTHORIZED
      );
    }

    if (apiKey !== validApikey) {
      throw new PresentationError("invalid api key", ErrorCode.UNAUTHORIZED);
    }

    return true;
  }
}
