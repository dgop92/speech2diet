from typing import List, TypedDict

from core.domain.entities.food_nutrition_request import FoodNutritionRequest


class ExpectedFoodItem(TypedDict):
    food: FoodNutritionRequest
    unit_variants: List[str]


class FoodExtractionTestCase(TypedDict):
    input_text: str
    expected_foods_items: List[ExpectedFoodItem]
