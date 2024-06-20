import { FoodRecord } from "../../../entities/nutrition-information-response";
import { AttrTypography } from "./AttrTypography";

export interface FoodItemContentProps {
  foodItem: FoodRecord;
}

export function FoodItemContent({ foodItem }: FoodItemContentProps) {
  return (
    <>
      <AttrTypography attrName="Nombre" attrValue={foodItem.food.food_name} />
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
        attrValue={`${foodItem.food.calories} kcal`}
      />
      <AttrTypography attrName="Grasas" attrValue={`${foodItem.food.fat} g`} />
      <AttrTypography
        attrName="Proteínas"
        attrValue={`${foodItem.food.protein} g`}
      />
      <AttrTypography
        attrName="Carbohidratos"
        attrValue={`${foodItem.food.carbohydrates} g`}
      />
    </>
  );
}
