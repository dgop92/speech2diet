import Joi from "joi";

export type Gender = "male" | "female";

export class HealthData {
  /** gender of the person, male or female */
  gender?: Gender;
  /** age in years */
  age?: number;
  /** height in cm */
  height?: number;
  /** weight in kg */
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
