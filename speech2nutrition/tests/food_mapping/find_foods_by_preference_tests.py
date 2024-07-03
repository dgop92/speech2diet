import logging
import unittest

import pytest

from core.components.food_mapping.application.food_finder import (
    find_foods_by_preference,
)
from core.components.food_mapping.definitions.repository import NutritionRepository
from core.components.food_mapping.infrastructure.repositories.mock_repository import (
    MockNutritionRepository,
)
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.nutrition_information_request import DBLookupPreference
from tests.food_mapping.utils import create_foods

logger = logging.getLogger(__name__)

assertions = unittest.TestCase()


@pytest.fixture
def repository1():
    data1 = create_foods([{"id": "1", "food_name": "arroz"}])
    return MockNutritionRepository(data1)


@pytest.fixture
def repository2():
    data2 = create_foods([{"id": "2", "food_name": "arroz"}])
    return MockNutritionRepository(data2)


@pytest.fixture
def repository3():
    data2 = create_foods([{"id": "3", "food_name": "carne"}])
    return MockNutritionRepository(data2)


@pytest.fixture
def food_request():
    return FoodNutritionRequest(
        food_name="arroz",
        description=["integral", "cocido"],
        amount=50,
        unit="g",
    )


def test_match_in_user_db_and_not_in_system_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food from user db and not from system db with order
    user_db then system_db
    """
    preference = DBLookupPreference.user_db_system_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository1,
        user_repository=repository2,
    )
    assertions.assertEqual(len(response.foods), 1)
    assertions.assertEqual(response.foods[0].id, "2")


def test_match_not_in_user_db_but_in_system_db(
    repository3: NutritionRepository,
    repository1: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food from system db and not from the user db with order
    user_db then system_db
    """
    preference = DBLookupPreference.user_db_system_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository1,
        user_repository=repository3,
    )

    assertions.assertEqual(len(response.foods), 1)
    assertions.assertEqual(response.foods[0].id, "1")


def test_match_in_system_db_and_not_in_user_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food from system db and not from user db with order
    system_db then user_db
    """
    preference = DBLookupPreference.system_db_user_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository1,
        user_repository=repository2,
    )

    assertions.assertEqual(len(response.foods), 1)
    assertions.assertEqual(response.foods[0].id, "1")


def test_match_not_in_system_db_but_in_user_db(
    repository3: NutritionRepository,
    repository1: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food from user db and not from system db with order
    system_db then user_db
    """
    preference = DBLookupPreference.system_db_user_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository3,
        user_repository=repository1,
    )

    assertions.assertEqual(len(response.foods), 1)
    assertions.assertEqual(response.foods[0].id, "1")


def test_match_in_user_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should found a match only in user db
    """
    preference = DBLookupPreference.user_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository1,
        user_repository=repository2,
    )

    assertions.assertEqual(len(response.foods), 1)
    assertions.assertEqual(response.foods[0].id, "2")


def test_no_match_in_user_db(
    repository1: NutritionRepository,
    repository3: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should not found a match in user db even if there is a match in system db
    """
    preference = DBLookupPreference.user_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository1,
        user_repository=repository3,
    )

    assertions.assertEqual(len(response.foods), 0)


def test_match_in_system_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should found a match only in system db
    """
    preference = DBLookupPreference.system_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository1,
        user_repository=repository2,
    )

    assertions.assertEqual(len(response.foods), 1)
    assertions.assertEqual(response.foods[0].id, "1")


def test_no_match_in_system_db(
    repository1: NutritionRepository,
    repository3: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should not found a match in system db even if there is a match in user db
    """
    preference = DBLookupPreference.system_db

    response = find_foods_by_preference(
        food_request=food_request,
        lookup_preference=preference,
        system_repository=repository3,
        user_repository=repository1,
    )

    assertions.assertEqual(len(response.foods), 0)
