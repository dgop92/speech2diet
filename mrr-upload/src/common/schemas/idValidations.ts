import Joi from "joi";

export const IntegerLookUpInputSchema = Joi.object({
  id: Joi.number().required(),
}).unknown();

// created because searchSchema has id optional
// unknown() is for ignoring extra properties
export const SearchByIdSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().required(),
  }).required(),
}).unknown();

export const SearchByUidSchema = Joi.object({
  searchBy: Joi.object({
    id: Joi.string().min(1).max(128).optional(),
  }).required(),
}).unknown();
