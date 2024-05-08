import Joi from "joi";

export const ALLOWED_AUDIO_MIME_TYPES = [
  "audio/mp3",
  "audio/mpeg",
  "audio/m4a",
  "audio/mp4",
];

export interface AudioMetadataInput {
  mimeType: string;
}

export const AudioMetadataCreateInputSchema = Joi.object({
  data: Joi.object({
    mimeType: Joi.string()
      .valid(...ALLOWED_AUDIO_MIME_TYPES)
      .required(),
  }).required(),
}).meta({ className: "AudioMetadataCreateInput" });
