from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

COMPOUND_TEST_SET: List[FoodExtractionTestCase] = [
    {
        "input_text": "Para la cena hay 80G de puré de papa",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="puré de papa",
                    description=[],
                    amount=80,
                    unit="g",
                ),
                "unit_variants": ["gr", "gramos"],
            },
        ],
    },
    {
        "input_text": "Me comí unas 3 alitas de pollo con una cucharada de salsa de tomate",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="alitas de pollo",
                    description=[],
                    amount=3,
                    unit="",
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="salsa de tomate",
                    description=[],
                    amount=1,
                    unit="cucharada",
                ),
                "unit_variants": ["cdas", "cucharadas"],
            },
        ],
    },
    {
        "input_text": "Hoy visité una nueva tienda y de almuerzo pedí un pez espada asado acompañado con 80 gramos papas al vapor",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="pez espada",
                    description=["asado"],
                    amount=1,
                    unit="",
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="papas",
                    description=["vapor"],
                    amount=80,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr"],
            },
        ],
    },
    {
        "input_text": "Hoy me comí 85 g de pan de maíz con 50 g",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="pan de maíz",
                    description=[],
                    amount=85,
                    unit="g",
                ),
                "unit_variants": ["gr", "gramos"],
            },
        ],
    },
    {
        "input_text": "Me estoy comiendo una barra de chocolate oscuro",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="barra chocolate oscuro",
                    description=[],
                    amount=1,
                    unit="",
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "Estoy comiendo 40 gramos de chocolate blanco",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="chocolate blanco",
                    description=[],
                    amount=40,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr"],
            },
        ],
    },
    {
        "input_text": "Estoy disfrutando 2 rebanadas de pan integral",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="rebanadas pan integral",
                    description=[],
                    amount=2,
                    unit="",
                ),
                "unit_variants": [],
            },
        ],
    },
]
