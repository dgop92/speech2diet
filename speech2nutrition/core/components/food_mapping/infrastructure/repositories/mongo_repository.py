import logging
from typing import Any, Dict, List

from pymongo import MongoClient

from core.domain.entities.food import Food, FoodSource

logger = logging.getLogger(__name__)


def system_db_data_to_food(document: Dict[str, Any]) -> Food:
    _id = document["id"]
    food_name = document["food_name"]
    other_names = document["other_names"]
    description = document["description"]
    full_description = document["search_keywords"]
    portion_reference = document["portion_size"]
    portion_unit = document["portion_size_unit"]
    food_source = FoodSource.system_db
    calories = document["calories"]
    protein = document["protein"]
    fat = document["fat"]
    carbs = document["carbohydrates"]
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
    def __init__(
        self, mongo_uri: str, db_name: str, collection_name: str, index_name: str
    ):
        logger.info("connecting to mongo database")
        self.client = MongoClient(mongo_uri)
        logger.info("connected to mongo database")
        self.mongo_db = self.client[db_name]
        self.collection_name = collection_name
        self.index_name = index_name

    def get_foods_by_name(self, name: str) -> List[Food]:
        """
        Get a list of foods by its name or other names
        """
        collection = self.mongo_db.get_collection(self.collection_name)
        logger.info(f"searching for food with name: {name}")
        result = collection.aggregate(
            [
                {
                    "$search": {
                        "index": self.index_name,
                        "text": {"query": name, "path": {"wildcard": "*"}},
                    }
                }
            ]
        )
        # TODO: limit the number of results in the query
        result = list(result)
        logger.info(f"number of results with name: {name} are equal to {len(result)}")
        foods = [system_db_data_to_food(usda_data) for usda_data in result]

        return foods

    def close(self):
        self.client.close()
