from typing import Callable, List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest

ExtractFoodComponent = Callable[[str], List[FoodNutritionRequest]]
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
