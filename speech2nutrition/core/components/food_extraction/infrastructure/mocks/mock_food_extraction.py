import json
from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest


class MockFoodExtractionService:
    def __call__(self, text: str) -> List[FoodNutritionRequest]:
        """
        Extract food names with its corresponding description, amount and unit from a
        text. As this is a mock it will parsed the text into a list of
        FoodNutritionRequest.
        """

        data = json.loads(text)
        food_nutrition_requests = []
        for food in data:
            food_nutrition_requests.append(FoodNutritionRequest(**food))

        return food_nutrition_requests
