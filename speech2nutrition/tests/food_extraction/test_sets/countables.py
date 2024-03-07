from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

COUNTABLES_TEST_SET: List[FoodExtractionTestCase] = [
    {
        "input_text": "Me comí una manzana",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="manzana", description=[], amount=1, unit=""
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "La cena de hoy fueron dos panes de tamaño mediano con un vaso de jugo de mora",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="panes", description=["mediano"], amount=2, unit=""
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="jugo de mora", description=[], amount=1, unit="vaso"
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "El almuerzo de hoy fue muy delicioso,  una mojarra frito guisada acompañada con dos papas blancas cocidas",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="mojarra",
                    description=["frito", "guisada"],
                    amount=1,
                    unit="",
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="papas",
                    description=["cocidas, blancas"],
                    amount=2,
                    unit="",
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "disfrutar un helado de vainilla",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="helado", description=["vainilla"], amount=1, unit=""
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "Los 2 tomates rojos que me ofreciste estaban deliciosos",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="tomates", description=["rojos"], amount=2, unit=""
                ),
                "unit_variants": [],
            },
        ],
    },
    {
        "input_text": "El tazón de pasta estuvo delicioso, las 2 cucharadas de sal le dieron un toque especial",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="pasta", description=[], amount=1, unit="tazón"
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="sal", description=[], amount=2, unit="cucharadas"
                ),
                "unit_variants": ["cdas"],
            },
        ],
    },
]
