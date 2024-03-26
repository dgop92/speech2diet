from logging import Logger
from typing import Any, Callable, Dict, List, Optional

from core.entities.common_food import CommonFood
from core.entities.serving_size_response import ServingSizeResponseModel
from core.tasks.generic_task import GenericTask

"""

USDA Raw Food data example:
{
    "id": 323604,
    "category": "Dairy and Egg Products",
    "calories": 146,
    "macro_nutrients": {
        "protein": {
            "amount": 12.3,
            "unit": "g"
        },
        "fat": {
            "amount": 10.3,
            "unit": "g"
        },
        "carbs": {
            "amount": 0.91,
            "unit": "g"
        }
    },
    "name": "huevo",
    "description": [
        "entero",
        "crudo",
        "congelado",
        "pasteurizado"
    ],
    "en_usda_description": "Egg, whole, raw, frozen, pasteurized",
    "es_usda_description": "Huevo, entero, crudo, congelado, pasteurizado",
    "food_names": [
        "huevo"
    ],
    "full_description": [
        "huevo",
        "entero",
        "crudo",
        "congelado",
        "pasteurizado"
    ]
},
"""


class MapUSDADataToCommonFoodTaskWithServing(GenericTask):

    def __init__(
        self,
        logger: Logger,
        env_name: str,
        serving_size_func: Callable[[str], Optional[ServingSizeResponseModel]],
    ) -> None:
        super().__init__(logger, env_name)
        self.serving_size_func = serving_size_func

    def map_usda_data_to_common_food(
        self, usda_data: List[Dict[str, Any]]
    ) -> List[CommonFood]:
        self.logger.info(f"mapping {len(usda_data)} usda foods to common foods")
        common_foods = []
        for food in usda_data:
            try:
                other_names = food.get("food_names", [])
                # remove the main name from the list of other names
                other_names = [name for name in other_names if name != food["name"]]

                # sadly, the usda foundation foods do not provide a serving size
                serving_size = 100
                serving_size_unit = "g"

                # try to get the serving size from the serving size extractor
                serving_size_model = self.serving_size_func(food["name"])

                if serving_size_model is not None:
                    serving_size = serving_size_model.serving_size
                    serving_size_unit = "g"

                common_food = CommonFood(
                    db_source_name="usdaFoundation",
                    food_name=food["name"],
                    other_names=other_names,
                    food_names=food["food_names"],
                    description=food["description"],
                    serving_size=serving_size,
                    serving_size_unit=serving_size_unit,
                    # all usda foundation foods are in 100g portion sizes
                    portion_size=100,
                    portion_size_unit="g",
                    calories=food["calories"],
                    protein=food["macro_nutrients"]["protein"]["amount"],
                    fat=food["macro_nutrients"]["fat"]["amount"],
                    carbohydrates=food["macro_nutrients"]["carbs"]["amount"],
                )
                common_foods.append(common_food)
            except Exception as e:
                food_id = food.get("id", "unknown")
                self.logger.warning(f"failed to map food with id {food_id}: {e}")

        return common_foods
