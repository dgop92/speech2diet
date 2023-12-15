import logging
from datetime import datetime

from application.request_handler import handle_nutrition_information_request
from config.logging import config_logger
from domain.entities.nutrition_information_request import (
    DBLookupPreference,
    NutritionInformationRequest,
)
from infrastructure.factories.factory import pipeline_factory

logger = logging.getLogger(__name__)


if __name__ == "__main__":
    config_logger()
    pipeline_components = pipeline_factory()
    s2t_service = pipeline_components.s2t_service
    food_extraction_service = pipeline_components.food_extraction_service
    system_repository = pipeline_components.system_repository
    user_repository = pipeline_components.user_repository
    map_food_to_nutrition_db = pipeline_components.map_food_to_nutrition_db

    try:
        request = NutritionInformationRequest(
            audio_id="audio-meals/audio-test-2.mp3",
            user_id="user-test",
            db_lookup_preference=DBLookupPreference.system_db,
            meal_recorded_at=datetime(2023, 12, 15, 0, 0, 0),
        )
        response = handle_nutrition_information_request(
            request,
            s2t_service,
            food_extraction_service,
            system_repository,
            user_repository,
            map_food_to_nutrition_db,
        )
        logger.info(f"response: {response}")
    except Exception as e:
        logger.error(f"error occurred: {e}", exc_info=True)
