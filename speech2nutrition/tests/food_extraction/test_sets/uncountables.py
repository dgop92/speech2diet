from typing import List

from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

UNCONTABLES_TEST_SET: List[FoodExtractionTestCase] = [
    {
        "input_text": "La cena fue 150 gramos de papas con 80 G de carne de ternero ",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="papas", description=[], amount=150, unit="gramos"
                ),
                "unit_variants": ["g", "gr", "gramo", "gramos"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="carne de ternero", description=[], amount=80, unit="g"
                ),
                "unit_variants": ["g", "gr", "gramo", "gramos"],
            },
        ],
    },
    {
        "input_text": "Estoy comiendo 20 gramos de zanahorias cocidas con un té de manzana helado de 100 ML",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="zanahorias",
                    description=["cocidas"],
                    amount=20,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr", "gramo", "gramos"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="té de manzana",
                    description=["helado"],
                    amount=100,
                    unit="ml",
                ),
                "unit_variants": ["ml", "mililitro", "mililitros"],
            },
        ],
    },
    {
        "input_text": "Bueno creo que comí 50 gramos huevos revueltos con 200 ML de leche",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="huevos",
                    description=["revueltos"],
                    amount=50,
                    unit="gramos",
                ),
                "unit_variants": ["g", "gr", "gramo", "gramos"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="leche", description=[], amount=200, unit="ml"
                ),
                "unit_variants": ["ml", "mililitro", "mililitros"],
            },
        ],
    },
    {
        "input_text": "El almuerzo fue una libra de posta de cerdo Con 40G de papas a la francesa",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="posta de cerdo", description=[], amount=1, unit="lb"
                ),
                "unit_variants": ["lb", "libra", "libras"],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="papas a la francesa",
                    description=[],
                    amount=40,
                    unit="g",
                ),
                "unit_variants": ["g", "gr", "gramo", "gramos"],
            },
        ],
    },
    {
        "input_text": "Mi cena fue algo simple lentejas con pechuga de pollo",
        "expected_foods_items": [
            {
                "food": FoodNutritionRequest(
                    food_name="lentejas", description=[], amount=0, unit=""
                ),
                "unit_variants": [],
            },
            {
                "food": FoodNutritionRequest(
                    food_name="pechuga de pollo", description=[], amount=0, unit=""
                ),
                "unit_variants": [],
            },
        ],
    },
]
