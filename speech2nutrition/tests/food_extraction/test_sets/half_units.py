from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

HALF_UNITS_TEST_SET: List[FoodExtractionTestCase] = [
    {
        "input_text": "Estoy cenando media libra de carne de cerdo",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="carne de cerdo",
                    description=[],
                    amount=0.5,
                    unit="libra",
                ),
                "unit_variants": ["lb"],
            },
        ],
    },
    {
        "input_text": "Estoy comiendo 1/4 de libra de queso con 2 arepas de maíz",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="queso",
                    description=[],
                    amount=0.25,
                    unit="libra",
                ),
                "unit_variants": ["lb"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="arepas de maíz",
                    description=[],
                    amount=2,
                    unit="",
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "Estoy desayunando media manzana con un banano",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="manzana",
                    description=[],
                    amount=0.5,
                    unit="",
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="banano",
                    description=[],
                    amount=1,
                    unit="",
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "Estoy merendando 2 huevos y medio",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="huevos",
                    description=[],
                    amount=2.5,
                    unit="",
                ),
                "unit_variants": [],
            }
        ],
    },
]
