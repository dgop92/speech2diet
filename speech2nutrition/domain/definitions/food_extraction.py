from typing import List, Protocol

from domain.entities.food_nutrition_request import FoodNutritionRequest


class FoodExtractionService(Protocol):
    def extract_foods_from_text(self, text: str) -> List[FoodNutritionRequest]:
        """
        Extract food names with its corresponding description, amount and unit from a text

        Parameters
        ----------
        text : str
            The text to extract the food names from

        Returns
        -------
        List[FoodNutritionRequest]
            A list of FoodNutritionRequest objects
        """
        ...
