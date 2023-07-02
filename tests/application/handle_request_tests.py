import logging
from datetime import datetime

import pytest

from application.request_handler import handle_nutrition_information_request
from application.s2t.services import Speech2TextService
from domain.entities.nutrition_information_request import (
    DBLookupPreference,
    NutritionInformationRequest,
)
from infrastructure.dev_components import (
    MockAudioStorage,
    MockFoodExtractionService,
    MockNutritionRepository,
    MockSpeech2TextToModel,
)
from tests.utils import create_foods, map_food_using_first_element

logger = logging.getLogger(__name__)


@pytest.fixture(scope="module")
def basic_components():
    data1 = create_foods(
        [
            {"id": "1", "food_name": "arroz"},
            {"id": "2", "food_name": "carne"},
            {"id": "3", "food_name": "papa"},
        ]
    )
    repository = MockNutritionRepository(data1)
    audio_storage = MockAudioStorage("audio-tests")
    speech2text_model = MockSpeech2TextToModel()
    food_extraction = MockFoodExtractionService()
    s2t = Speech2TextService(audio_storage, speech2text_model)
    map_food_to_nutrition_db = map_food_using_first_element
    return (
        repository,
        s2t,
        food_extraction,
        map_food_to_nutrition_db,
    )


def test_request_handler_2_food_requests(basic_components):
    repository, s2t, food_extraction, map_food_to_nutrition_db = basic_components

    request = NutritionInformationRequest(
        user_id="uid-10",
        db_lookup_preference=DBLookupPreference.system_db,
        audio_id="arroz-carne-audio.json",
        meal_recorded_at=datetime.now(),
    )
    result = handle_nutrition_information_request(
        request=request,
        food_extraction_service=food_extraction,
        s2t_service=s2t,
        system_repository=repository,
        user_repository=repository,
        map_food_to_nutrition_db=map_food_to_nutrition_db,
    )

    assert len(result.food_requests) == 2
    assert len(result.food_responses) == 2

    food_responses = result.food_responses
    food_names = set(
        [food_response.food_record.food.food_name for food_response in food_responses]
    )
    expected_food_names = {"arroz", "carne"}
    assert food_names == expected_food_names


def test_request_handler_0_food_requests(basic_components):
    repository, s2t, food_extraction, map_food_to_nutrition_db = basic_components

    request = NutritionInformationRequest(
        user_id="uid-12",
        db_lookup_preference=DBLookupPreference.system_db,
        audio_id="empty-audio.json",
        meal_recorded_at=datetime.now(),
    )
    result = handle_nutrition_information_request(
        request=request,
        food_extraction_service=food_extraction,
        s2t_service=s2t,
        system_repository=repository,
        user_repository=repository,
        map_food_to_nutrition_db=map_food_to_nutrition_db,
    )

    assert len(result.food_requests) == 0
    assert len(result.food_responses) == 0
