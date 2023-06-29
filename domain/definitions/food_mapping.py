from typing import Callable, List, Protocol

from domain.entities.food import Food
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse


class NutritionRepository(Protocol):
    def get_foods_by_name(self, name: str) -> List[Food]:
        """
        Get a list of foods by its name or other names
        """
        ...


MapFoodToNutritionDBRecord = Callable[
    [FoodNutritionRequest, NutritionRepository],
    FoodNutritionResponse,
]
"""
Given the food information reported by the user, map it to a food record in the nutrition database
"""
