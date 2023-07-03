import logging

import pytest

from application.request_handler import map_food_in_repositories
from domain.definitions.food_mapping import NutritionRepository
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.nutrition_information_request import DBLookupPreference
from infrastructure.dev_components import MockNutritionRepository
from tests.utils import create_foods, map_food_using_first_element

logger = logging.getLogger(__name__)


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


def test_match_in_user_db_an_not_in_system_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food record found in user db and not in the system db with order
    user_db then system_db
    """
    preference = DBLookupPreference.user_db_system_db

    response = map_food_in_repositories(
        request=food_request,
        user_repository=repository1,
        system_repository=repository2,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is not None
    assert response.food_record.food.id == "1"


def test_match_not_in_user_db_but_in_system_db(
    repository3: NutritionRepository,
    repository1: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food record found in system db and not in the user db with order
    user_db then system_db
    """
    preference = DBLookupPreference.user_db_system_db

    response = map_food_in_repositories(
        request=food_request,
        user_repository=repository3,
        system_repository=repository1,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is not None
    assert response.food_record.food.id == "1"


def test_no_match_in_both_repositories_user_system(
    repository3: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should not found a match in both repositories with order user_db then system_db
    """
    preference = DBLookupPreference.user_db_system_db

    response = map_food_in_repositories(
        request=food_request,
        system_repository=repository3,
        user_repository=repository3,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is None


def test_match_in_system_db_an_not_in_user_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should return one food record found in system db and not in the user db with order
    system_db then user_db
    """
    preference = DBLookupPreference.system_db_user_db

    response = map_food_in_repositories(
        request=food_request,
        system_repository=repository1,
        user_repository=repository2,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is not None
    assert response.food_record.food.id == "1"


def test_match_in_user_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should found a match only in user db
    """
    preference = DBLookupPreference.user_db

    response = map_food_in_repositories(
        request=food_request,
        user_repository=repository2,
        system_repository=repository1,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is not None
    assert response.food_record.food.id == "2"


def test_no_match_in_user_db(
    repository1: NutritionRepository,
    repository3: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should not found a match in user db even if there is a match in system db
    """
    preference = DBLookupPreference.user_db

    response = map_food_in_repositories(
        request=food_request,
        user_repository=repository3,
        system_repository=repository1,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is None


def test_match_in_system_db(
    repository1: NutritionRepository,
    repository2: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should found a match only in system db
    """
    preference = DBLookupPreference.system_db

    response = map_food_in_repositories(
        request=food_request,
        system_repository=repository1,
        user_repository=repository2,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is not None
    assert response.food_record.food.id == "1"


def test_no_match_in_system_db(
    repository2: NutritionRepository,
    repository3: NutritionRepository,
    food_request: FoodNutritionRequest,
):
    """
    should not found a match in system db even if there is a match in user db
    """
    preference = DBLookupPreference.system_db

    response = map_food_in_repositories(
        request=food_request,
        system_repository=repository3,
        user_repository=repository2,
        lookup_preference=preference,
        map_food_to_nutrition_db=map_food_using_first_element,
    )

    assert response.food_record is None
