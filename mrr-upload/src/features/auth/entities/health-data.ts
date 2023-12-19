import Joi from "joi";

export type Gender = "male" | "female";

export interface HealthData {
  gender?: Gender;
  age?: number;
  /* height in cm */
  height?: number;
  /* weight in kg */
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
    id: Joi.string().required(),
  }).required(),
}).meta({ className: "HealthDataUpdateInput" });
