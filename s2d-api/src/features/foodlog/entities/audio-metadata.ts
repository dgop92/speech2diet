import Joi from "joi";

export const ALLOWED_AUDIO_MIME_TYPES = ["audio/mp3", "audio/mpeg"];
export const ALLOWED_AUDIO_MIME_FORMATS = ["mp3", "mpeg"];

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
