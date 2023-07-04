import Joi from "joi";

export type Gender = "male" | "female";

export interface HealthData {
  gender?: Gender;
  age?: number;
  height?: number;
  weight?: number;
}

export const HealthDataUpdateInputSchema = Joi.object({
  data: Joi.object({
    gender: Joi.string().valid("male", "female").optional(),
    age: Joi.number().min(0).optional(),
    height: Joi.number().min(0).optional(),
    weight: Joi.number().min(0).optional(),
  }).required(),
  searchBy: Joi.object({
    id: Joi.number().required(),
  }).required(),
}).meta({ className: "HealthDataUpdateInput" });
