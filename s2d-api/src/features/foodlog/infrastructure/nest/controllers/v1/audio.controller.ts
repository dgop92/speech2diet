import { User } from "@features/auth/entities/user";
import { GetUser } from "@features/auth/infrastructure/nest/custom-decorators";
import { UserGuard } from "@features/auth/infrastructure/nest/guards/users.guard";
import {
  Controller,
  Post,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { UploadService } from "../../upload.service";
import { myNutritionRequestPublisherFactory } from "@features/foodlog/factories/nutrition-request-publisher.factory";
import { INutritionRequestPublisher } from "@features/foodlog/ports/nutrition-request-publisher.definition";

@Controller({
  path: "report",
  version: "1",
})
export class AudioControllerV1 {
  private readonly nutritionRequestPublisher: INutritionRequestPublisher;

  constructor(private readonly uploadService: UploadService) {
    const { nutritionRequestPublisher } = myNutritionRequestPublisherFactory();
    this.nutritionRequestPublisher = nutritionRequestPublisher;
  }

  @UseGuards(UserGuard)
  @Post("/upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /^audio\/(mp3|mpeg)$/ })
        .addMaxSizeValidator({ maxSize: 1024 * 1024 * 5 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY })
    )
    file: Express.Multer.File,
    @GetUser() user: User
  ) {
    const mimeType = file.mimetype;
    const audioId = await this.uploadService.upload(file.buffer, mimeType);
    const nir = await this.nutritionRequestPublisher.publish(
      { data: { audioId } },
      user.appUser
    );
    return { message: "success", body: nir };
  }
}
