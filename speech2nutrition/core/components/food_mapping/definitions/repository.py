from typing import Callable, List, Protocol

from core.domain.entities.food import Food
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.food_nutrition_response import FoodNutritionResponse


class NutritionRepository(Protocol):
    def get_foods_by_name(self, name: str) -> List[Food]:
        """
        Get a list of foods by its name or other names
        """
        ...


MapFoodToNutritionDBComponent = Callable[
    [FoodNutritionRequest, NutritionRepository],
    FoodNutritionResponse,
]
"""
Given the food information reported by the user, map it to a food record in the nutrition database
"""
