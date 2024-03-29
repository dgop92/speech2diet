import { ApiProperty } from "@nestjs/swagger";

export class AudioFileUploadDTO {
  @ApiProperty({ type: "string", format: "binary" })
  file: any;
}
