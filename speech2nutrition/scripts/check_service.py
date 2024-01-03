import argparse
import logging
from datetime import datetime

from config.logging import config_logger
from core.core_factory import core_factory
from core.domain.entities.nutrition_information_request import (
    DBLookupPreference,
    NutritionInformationRequest,
)

logger = logging.getLogger(__name__)


if __name__ == "__main__":
    config_logger()

    parser = argparse.ArgumentParser(
        description="Test all components of the speech to nutrition service"
    )
    parser.add_argument(
        "--audio-id",
        type=str,
        help="The audio id to use for the request",
    )

    args = parser.parse_args()

    request_handler = core_factory()

    try:
        request = NutritionInformationRequest(
            audioId=args.audio_id,
            appUserId="user-test",
            dbLookupPreference=DBLookupPreference.system_db,
            mealRecordedAt=datetime(2023, 12, 15, 0, 0, 0),
        )
        response = request_handler(request)
        logger.info(f"response: {response.json(ensure_ascii=False)}")
    except Exception as e:
        logger.exception(f"error handling nutrition request: {e}")
