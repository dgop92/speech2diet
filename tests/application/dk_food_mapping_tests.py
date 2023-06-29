import logging
import unittest

from application.dk_food_mapping.core import dk_map_food_to_nutrition_db
from domain.definitions.food_mapping import NutritionRepository
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse
from tests.tests_components.food_mapping import (
    MockNutritionRepository,
    score_food_by_exact_match,
)
from tests.tests_components.utils import create_foods

logger = logging.getLogger(__name__)


def map_food(
    fn_req: FoodNutritionRequest,
    repository: NutritionRepository,
) -> FoodNutritionResponse:
    return dk_map_food_to_nutrition_db(fn_req, repository, score_food_by_exact_match)


class DKFoodMappingTest(unittest.TestCase):
    def test_1_match(self):
        """
        should return one food record and no suggestions
        """

        request = FoodNutritionRequest(
            food_name="arroz",
            description=["integral", "cocido"],
            amount=50,
            unit="g",
        )
        data = create_foods(
            [
                {
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                },
                {
                    "food_name": "carne de res",
                    "full_description": ["sin grasa", "cocida"],
                },
            ]
        )
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertNotEqual(response.food_record, None)
        self.assertEqual(response.food_record.food.food_name, "arroz")
        self.assertEqual(response.suggestions, [])
        self.assertEqual(response.user_amount, 50)
        self.assertEqual(response.user_unit, "g")

    def test_1_match_2_suggestions(self):
        """
        should return one food record and 2 suggestions
        """

        request = FoodNutritionRequest(
            food_name="carne",
            description=["cerdo"],
            amount=50,
            unit="g",
        )
        data = create_foods(
            [
                {
                    "id": "1",
                    "food_name": "carne",
                    "full_description": ["res", "sin grasa", "cocida"],
                },
                {
                    "id": "2",
                    "food_name": "carne",
                    "full_description": ["cerdo", "sin grasa", "cocida"],
                },
                {
                    "id": "3",
                    "food_name": "carne",
                    "full_description": ["pollo", "sin grasa", "cocida"],
                },
                {
                    "id": "4",
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                },
            ]
        )
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertNotEqual(response.food_record, None)
        self.assertEqual(response.food_record.food.food_name, "carne")
        self.assertEqual(response.food_record.food.id, "2")
        self.assertEqual(len(response.suggestions), 2)

        suggestions_ids = [s.food.id for s in response.suggestions]
        self.assertSetEqual(set(suggestions_ids), {"1", "3"})

        self.assertEqual(response.user_amount, 50)
        self.assertEqual(response.user_unit, "g")

    def test_1_match_max_suggestions(self):
        """
        should return one food record and the maximum number of suggestions (3)
        """

        request = FoodNutritionRequest(
            food_name="carne",
            description=["cerdo"],
            amount=50,
            unit="g",
        )
        data = create_foods(
            [
                {
                    "id": "1",
                    "food_name": "carne",
                    "full_description": ["res", "sin grasa", "cocida"],
                },
                {
                    "id": "2",
                    "food_name": "carne",
                    "full_description": ["cerdo", "sin grasa", "cocida"],
                },
                {
                    "id": "3",
                    "food_name": "carne",
                    "full_description": ["pollo", "sin grasa", "cocida"],
                },
                {
                    "id": "4",
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                },
                {
                    "id": "5",
                    "food_name": "carne",
                    "full_description": ["vacuna", "sin grasa", "cocida"],
                },
                {
                    "id": "6",
                    "food_name": "carne",
                    "full_description": ["generica", "sin grasa", "cocida"],
                },
            ]
        )
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertNotEqual(response.food_record, None)
        self.assertEqual(response.food_record.food.food_name, "carne")
        self.assertEqual(response.food_record.food.id, "2")
        self.assertEqual(len(response.suggestions), 3)

        self.assertEqual(response.user_amount, 50)
        self.assertEqual(response.user_unit, "g")

    def test_no_match(self):
        """
        should return no food record and no suggestions if could not find any food
        record with the given name
        """
        request = FoodNutritionRequest(
            food_name="lentejas",
            description=[],
            amount=80,
            unit="g",
        )
        data = create_foods(
            [
                {
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                },
            ]
        )
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertEqual(response.food_record, None)
        self.assertEqual(response.suggestions, [])
        self.assertEqual(response.user_amount, 80)
        self.assertEqual(response.user_unit, "g")

    def test_food_unit_is_not_in_grams(self):
        """
        should raise an error if the food unit is not grams
        """
        request = FoodNutritionRequest(
            food_name="arroz",
            description=[],
            amount=80,
            unit="g",
        )
        data = create_foods(
            [
                {
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                    "portion_unit": "oz",
                    "portion_reference": 4,
                },
            ]
        )
        repository = MockNutritionRepository(data)
        with self.assertRaises(ValueError) as e:
            map_food(request, repository)

        self.assertEqual(
            str(e.exception),
            "Food unit is not grams, this mapping implementation only supports grams",
        )

    def test_can_transform_user_unit_to_food_portion_unit(self):
        """
        should raise an error if the food unit is not grams
        """
        request = FoodNutritionRequest(
            food_name="arroz",
            description=[],
            amount=1,
            unit="taza",
        )
        data = create_foods(
            [
                {
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                },
            ]
        )
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertEqual(response.food_record.amount, 200)
        self.assertEqual(response.food_record.unit_was_transformed, True)

    def test_cannot_transform_user_unit_to_food_portion_unit(self):
        """
        should raise an error if the food unit is not grams
        """
        request = FoodNutritionRequest(
            food_name="arroz",
            description=[],
            amount=1,
            unit="tazon",
        )
        data = create_foods(
            [
                {
                    "food_name": "arroz",
                    "full_description": ["integral", "cocido"],
                },
            ]
        )
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertEqual(response.food_record.amount, 0)
        self.assertEqual(response.food_record.unit_was_transformed, False)
