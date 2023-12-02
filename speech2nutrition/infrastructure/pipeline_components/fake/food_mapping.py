import logging
from typing import List

from domain.entities.food import Food

logger = logging.getLogger(__name__)


class MockNutritionRepository:
    def __init__(self, data: List[Food]):
        self.data = data

    def get_foods_by_name(self, name: str) -> List[Food]:
        """
        Get a list of foods by its name or other names
        """
        logger.debug(f"searching for food with name: {name}")
        results: List[Food] = []
        for food in self.data:
            possible_names = [food.food_name] + food.other_names
            lower_names = [n.lower() for n in possible_names]
            if name.lower() in lower_names:
                results.append(food)

        logger.debug(f"found {len(results)} foods")
        return results
