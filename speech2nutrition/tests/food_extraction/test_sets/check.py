from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

CHECK_TEST_SET: List[FoodExtractionTestCase] = [
    {
        "input_text": "Estoy comiéndome 80 gramos de pollo asado con 120 gramos de arroz integral",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="pollo",
                    description=["asado"],
                    amount=80,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr", "gramo"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="arroz integral",
                    description=[],
                    amount=120,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr", "gramo"],
            },
        ],
    }
]
