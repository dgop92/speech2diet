from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

BASIC_TEST_SET: List[FoodExtractionTestCase] = [
    {
        "input_text": "Mi almuerzo de hoy fue 80 gramos de carne molida, 5 cucharadas de lentejas y un tazón de papas",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="carne",
                    description=["molida"],
                    amount=80,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr", "gramo", "gramos"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="lentejas",
                    description=[],
                    amount=5,
                    unit="cucharadas",
                ),
                "unit_variants": ["cdas"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="papas", description=[], amount=1, unit="tazón"
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "De merienda disfruté unas 2 galletas de soda con un jugo de fresa",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="galletas", description=["soda"], amount=2, unit=""
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="jugo", description=["fresa"], amount=0, unit=""
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "Tenía hambre y me comí 3 papas cocidas",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="papas", description=["cocidas"], amount=3, unit=""
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "Para toda la familia hicimos 1 kg de espaguetis",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="espaguetis", description=[], amount=1, unit="kg"
                ),
                "unit_variants": [
                    "kilogramos",
                    "kilos",
                    "kilo",
                    "kgs",
                    "kg",
                    "k",
                ],
            },
        ],
    },
    {
        "input_text": "Mi cena de hoy fue 3 sándwiches con 300 ml de jugo de maracuyá",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="sándwiches", description=[], amount=3, unit=""
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="jugo de maracuyá", description=[], amount=300, unit="ml"
                ),
                "unit_variants": ["mililitros", "ml"],
            },
        ],
    },
    {
        "input_text": "Mañana sábado tengo un parcial de cálculo 2",
        "expected_foods_items": [],
    },
]
