import { UnitTransformationInfo } from "../../../entities/nutrition-information-response";

export function getTransformationMessage(
  transInfo: UnitTransformationInfo | null,
  userAmount: number
) {
  if (transInfo === null) {
    return "Usando cantidad de ración";
  }

  if (transInfo.original_unit === "" && userAmount > 0) {
    return `Usando cantidad del usuario por cantidad de ración. ${userAmount} * ${transInfo.transformation_factor}`;
  }

  return `Usando tasa de conversión: ${transInfo.original_unit} -> ${transInfo.transformation_factor} ${transInfo.final_unit}`;
}
