import { Stack, Typography } from "@mui/material";
import {
  FoodNutritionRequest,
  FoodNutritionResponse,
} from "../../../entities/nutrition-information-response";
import { AttrTypography } from "./AttrTypography";
import { CardHeader } from "./CardHeader";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { getTransformationMessage } from "./utils";

export interface FoodCardProps {
  foodNutritionRequest: FoodNutritionRequest;
  foodNutritionResponse: FoodNutritionResponse;
}

export function FoodCard({
  foodNutritionRequest,
  foodNutritionResponse,
}: FoodCardProps) {
  const foodItem = foodNutritionResponse.food_record ?? null;

  return (
    <Stack
      sx={{
        backgroundColor: "white",
        borderRadius: "0.5rem",
        px: 2,
      }}
    >
      <Stack>
        <CardHeader title="Alimento encontrado" />
        <AttrTypography
          attrName="Nombre"
          attrValue={foodNutritionRequest.food_name}
        />
        <AttrTypography
          attrName="Descripción"
          attrValue={foodNutritionRequest.description.join("-")}
          defaultValue="Sin descripción"
        />
        <AttrTypography
          attrName="Cantidad"
          attrValue={foodNutritionRequest.amount.toString()}
          defaultValue="Cantidad no especificada"
        />
        <AttrTypography
          attrName="Unidad"
          attrValue={foodNutritionRequest.unit}
          defaultValue="Unidad no especificada"
        />
      </Stack>

      {foodItem !== null && (
        <>
          <Stack>
            <CardHeader title="Mejor match en la DB" />
            <AttrTypography
              attrName="Nombre"
              attrValue={foodItem.food.food_name}
            />
            <AttrTypography
              attrName="Descripción"
              attrValue={foodItem.food.description.join(", ")}
            />
            <AttrTypography
              attrName="Porción"
              attrValue={`${foodItem.food.portion_size} ${foodItem.food.portion_size_unit}`}
            />
            <AttrTypography
              attrName="Ración"
              attrValue={`${foodItem.food.serving_size} ${foodItem.food.serving_size_unit}`}
            />
            <AttrTypography
              attrName="Calorías"
              attrValue={foodItem.food.calories.toString()}
            />
            <AttrTypography
              attrName="Grasas"
              attrValue={foodItem.food.fat.toString()}
            />
            <AttrTypography
              attrName="Proteínas"
              attrValue={foodItem.food.protein.toString()}
            />
            <AttrTypography
              attrName="Carbohidratos"
              attrValue={foodItem.food.carbohydrates.toString()}
            />
          </Stack>
          <Stack mb={1}>
            <CardHeader title="Cantidad final" />
            <AttrTypography
              attrName="Total"
              attrValue={`${foodItem.amount} g/ml`}
            />
            <AttrTypography
              attrName="Nota"
              attrValue={getTransformationMessage(
                foodItem.unit_transformation_info,
                foodNutritionResponse.user_amount
              )}
            />
          </Stack>
        </>
      )}

      {foodItem == null && (
        <Stack mb={1}>
          <CardHeader title="Encontrado en la DB" />
          <Stack direction="row" py={1} alignItems="center">
            <SearchOffIcon sx={{ mr: 1 }} />
            <Typography variant="body1">
              Lo sentimos, no encontramos información nutricional para este
              alimento.
            </Typography>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
