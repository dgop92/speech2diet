import { Button, Stack, Typography } from "@mui/material";
import {
  FoodNutritionRequest,
  FoodNutritionResponse,
} from "../../../entities/nutrition-information-response";
import { AttrTypography } from "./AttrTypography";
import { CardHeader } from "./CardHeader";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import { getTransformationMessage } from "./utils";
import { useState } from "react";
import { SuggestionModal } from "./SuggestionModal";
import { FoodItemContent } from "./FoodItemContent";

export interface FoodCardProps {
  foodNutritionRequest: FoodNutritionRequest;
  foodNutritionResponse: FoodNutritionResponse;
}

export function FoodCard({
  foodNutritionRequest,
  foodNutritionResponse,
}: FoodCardProps) {
  const [suggestionModal, setSuggestionModal] = useState(false);

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
          attrValue={foodNutritionRequest.description.join(",")}
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
            <CardHeader title="Información nutricional" />
            <FoodItemContent foodItem={foodItem} />
          </Stack>
          <Stack>
            <CardHeader title="Cantidad final" />
            <AttrTypography
              attrName="Total consumido"
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
          <Stack mb={1}>
            <CardHeader title="Sugerencias" />
            <Button
              color="primary"
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => setSuggestionModal(true)}
            >
              Ver sugerencias
            </Button>
          </Stack>
          <SuggestionModal
            open={suggestionModal}
            onClose={() => setSuggestionModal(false)}
            suggestions={foodNutritionResponse.suggestions}
          />
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
