import logging
import unittest

from core.components.food_mapping.definitions.repository import NutritionRepository
from core.components.food_mapping.infrastructure.repositories.mock_repository import (
    MockNutritionRepository,
)
from core.components.food_mapping.infrastructure.unit_module.simple_unit import (
    compute_new_amount_to_grams,
)
from core.components.food_mapping.map_algorithm import FoodMapper
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.food_nutrition_response import FoodNutritionResponse
from core.domain.entities.nutrition_information_request import DBLookupPreference
from tests.food_mapping.utils import create_foods, score_food_by_exact_match

logger = logging.getLogger(__name__)


def map_food(
    request: FoodNutritionRequest,
    system_repository: NutritionRepository,
) -> FoodNutritionResponse:
    food_mapper = FoodMapper(
        system_repository=system_repository,
        score_function=score_food_by_exact_match,
        unit_function=compute_new_amount_to_grams,
    )
    return food_mapper(
        request=request, lookup_preference=DBLookupPreference.system_db, app_user_id="1"
    )


class FoodMapperTest(unittest.TestCase):
    def test_one_match(self):
        """
        should return one food record and no suggestions
        """

        request = FoodNutritionRequest(
            food_name="arroz",
            description=["integral", "cocido"],
            amount=50,
            unit="g",
        )
        data = create_foods([
            {
                "food_name": "arroz",
                "full_description": ["integral", "cocido"],
            },
            {
                "food_name": "carne de res",
                "full_description": ["sin grasa", "cocida"],
            },
        ])
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertNotEqual(response.food_record, None)
        self.assertEqual(response.food_record.food.food_name, "arroz")
        self.assertEqual(response.suggestions, [])
        self.assertEqual(response.user_amount, 50)
        self.assertEqual(response.user_unit, "g")

    def test_one_match_two_suggestions(self):
        """
        should return one food record and two suggestions
        """

        request = FoodNutritionRequest(
            food_name="carne",
            description=["cerdo"],
            amount=50,
            unit="g",
        )
        data = create_foods([
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
        ])
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

    def test_one_match_max_suggestions(self):
        """
        should return one food record and the maximum number of suggestions (3)
        """

        request = FoodNutritionRequest(
            food_name="carne",
            description=["cerdo"],
            amount=50,
            unit="g",
        )
        data = create_foods([
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
        ])
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
        data = create_foods([
            {
                "food_name": "arroz",
                "full_description": ["integral", "cocido"],
            },
        ])
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertEqual(response.food_record, None)
        self.assertEqual(response.suggestions, [])
        self.assertEqual(response.user_amount, 80)
        self.assertEqual(response.user_unit, "g")

    # The following tests depend on the unit module

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
        data = create_foods([
            {
                "food_name": "arroz",
                "full_description": ["integral", "cocido"],
                "portion_unit": "oz",
                "portion_reference": 4,
            },
        ])
        repository = MockNutritionRepository(data)
        with self.assertRaises(ValueError) as e:
            map_food(request, repository)

        self.assertEqual(
            str(e.exception),
            "Food unit is not grams, this mapping implementation only supports grams",
        )

    def test_can_transform_user_unit_to_food_portion_unit(self):
        """
        should transform user unit to food portion unit
        """
        request = FoodNutritionRequest(
            food_name="arroz",
            description=[],
            amount=1,
            unit="taza",
        )
        data = create_foods([
            {
                "food_name": "arroz",
                "full_description": ["integral", "cocido"],
            },
        ])
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        self.assertEqual(response.food_record.amount, 200)
        self.assertEqual(response.food_record.unit_was_transformed, True)

    def test_use_default_in_user_unit_to_food_portion_unit(self):
        """
        should use portion reference as default if cannot transform user unit
        to food portion unit
        """
        request = FoodNutritionRequest(
            food_name="arroz",
            description=[],
            amount=1,
            unit="tazon",
        )
        data = create_foods([
            {
                "food_name": "arroz",
                "full_description": ["integral", "cocido"],
            },
        ])
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        # for testin all foods have portion reference of 100
        self.assertEqual(response.food_record.amount, 100)
        self.assertEqual(response.food_record.unit_was_transformed, True)

    def test_use_default_portion_reference_if_unit_not_reported(self):
        """
        should use portion reference as default if unit is not reported
        """
        request = FoodNutritionRequest(
            food_name="arroz",
            description=[],
            amount=0,
            unit="",
        )
        data = create_foods([
            {
                "food_name": "arroz",
                "full_description": ["integral", "cocido"],
            },
        ])
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        # for testin all foods have portion reference of 100
        self.assertEqual(response.food_record.amount, 100)
        self.assertEqual(response.food_record.unit_was_transformed, True)

    def test_use_default_portion_reference_if_unit_not_reported_but_amount_was(self):
        """
        should use portion reference as default to multiply by its quantity if unit is not reported (countable food)
        """
        request = FoodNutritionRequest(
            food_name="manzana",
            description=[],
            amount=2,
            unit="",
        )
        data = create_foods([
            {
                "food_name": "manzana",
                "full_description": ["cruda"],
            },
        ])
        repository = MockNutritionRepository(data)
        response = map_food(request, repository)

        # for testin all foods have portion reference of 100
        self.assertEqual(response.food_record.amount, 200)
        self.assertEqual(response.food_record.unit_was_transformed, True)
