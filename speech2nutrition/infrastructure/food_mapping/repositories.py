import logging
from typing import Any, Dict, List

from config.database import MongoDatabase
from domain.entities.food import Food

logger = logging.getLogger(__name__)


def usda_data_to_food(usda_data: Dict[str, Any]) -> Food:
    _id = usda_data["id"]
    food_name = usda_data["name"]
    other_names = usda_data["food_names"][1:]
    description = usda_data["description"]
    full_description = usda_data["cleaned_full_description"]
    portion_reference = "100"
    portion_unit = "g"
    food_source = "system_db"
    calories = usda_data["calories"]
    protein = usda_data["macro_nutrients"]["protein"]["amount"]
    fat = usda_data["macro_nutrients"]["fat"]["amount"]
    carbs = usda_data["macro_nutrients"]["carbs"]["amount"]
    return Food(
        id=_id,
        food_name=food_name,
        other_names=other_names,
        description=description,
        full_description=full_description,
        portion_reference=portion_reference,
        portion_unit=portion_unit,
        food_source=food_source,
        calories=calories,
        protein=protein,
        fat=fat,
        carbohydrates=carbs,
    )


class SystemNutritionRepository:
    def __init__(self, mongo_db: MongoDatabase):
        self.mongo_db = mongo_db

    def get_foods_by_name(self, name: str) -> List[Food]:
        """
        Get a list of foods by its name or other names
        """
        collection = self.mongo_db.get_collection("usda_nutrition_db")
        logger.info(f"searching for food with name: {name}")
        result = collection.aggregate(
            [
                {
                    "$search": {
                        "index": "foods_names_index",
                        "text": {"query": name, "path": {"wildcard": "*"}},
                    }
                }
            ]
        )
        # TODO: limit the number of results in the query
        result = list(result)
        logger.info(f"number of results with name: {name} are equal to {len(result)}")
        foods = [usda_data_to_food(usda_data) for usda_data in result]

        return foods
