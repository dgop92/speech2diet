import logging

from config.settings_v2 import APP_CONFIG
from core.components.food_extraction.definitions import ExtractFoodComponent
from core.components.food_extraction.infrastructure.gpt import (
    ChatGPTFoodExtractionService,
)
from core.components.food_extraction.infrastructure.mocks.mock_food_extraction import (
    MockFoodExtractionService,
)

logger = logging.getLogger(__name__)


def food_extraction_component_factory() -> ExtractFoodComponent:
    if APP_CONFIG.mock_services:
        logger.info("creating mock food extraction service")
        extraction_service = MockFoodExtractionService()
    else:
        logger.info("creating chatgpt food extraction service")
        extraction_service = ChatGPTFoodExtractionService(
            openai_key=APP_CONFIG.open_ai_key,
            engine=APP_CONFIG.open_ai_engine,
        )
    return extraction_service
