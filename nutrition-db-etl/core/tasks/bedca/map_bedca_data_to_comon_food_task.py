from typing import Any, Dict, List

from core.entities.common_food import CommonFood
from core.tasks.generic_task import GenericTask

"""
Bedca Raw Food data example:
{
    "name": "Chocolate negro, con azúcar",
    "nutrition_information": [
        {
            "name": "calories",
            "amount": "529",
            "unit": "Kcal"
        },
        {
            "name": "protein",
            "amount": "2",
            "unit": "g"
        },
        {
            "name": "carbohydrates",
            "amount": "63",
            "unit": "g"
        },
        {
            "name": "fat",
            "amount": "30",
            "unit": "g"
        }
    ]
},
"""


class MapBedcaDataToCommonFoodTask(GenericTask):

    def map_bedca_data_to_common_food(
        self, bedca_data: List[Dict[str, Any]]
    ) -> List[CommonFood]:
        self.logger.info(f"mapping {len(bedca_data)} bedca foods to common foods")
        common_foods = []
        for food in bedca_data:
            try:
                words = food["name"].split(", ")
                # remove trailing and leading whitespaces
                words = [word.strip() for word in words]
                name = words[0]
                description = words[1:]

                nutrition_information = food["nutrition_information"]

                # make sure that all macro nutrients are in grams
                for ni in nutrition_information[1:]:
                    if ni["unit"] != "g":
                        raise ValueError(f"unit {ni['unit']} is not in grams")

                calories = float(nutrition_information[0]["amount"])
                protein = float(nutrition_information[1]["amount"])
                carbohydrates = float(nutrition_information[2]["amount"])
                fat = float(nutrition_information[3]["amount"])

                common_food = CommonFood(
                    db_source_name="bedca",
                    food_name=name,
                    other_names=[],
                    food_names=[name],
                    description=description,
                    # sadly, bedca foods do not provide a serving size
                    serving_size=100,
                    serving_size_unit="g",
                    # all bedca foods are in 100g portion sizes
                    portion_size=100,
                    portion_size_unit="g",
                    calories=calories,
                    protein=protein,
                    carbohydrates=carbohydrates,
                    fat=fat,
                )
                common_foods.append(common_food)

            except Exception as e:
                food_id = food["name"]
                self.logger.warning(f"failed to map food with id {food_id}: {e}")

        return common_foods
