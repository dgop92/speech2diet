import logging

from config.settings import MOCK_SERVICES, OPENAI_CONFIG
from core.components.food_extraction.definitions import ExtractFoodComponent
from core.components.food_extraction.infrastructure.gpt import (
    ChatGPTFoodExtractionService,
)
from core.components.food_extraction.infrastructure.mocks.mock_food_extraction import (
    MockFoodExtractionService,
)

logger = logging.getLogger(__name__)


def speech2text_component_factory() -> ExtractFoodComponent:
    if MOCK_SERVICES:
        logger.info("creating mock food extraction service")
        extraction_service = MockFoodExtractionService()
    else:
        logger.info("creating chatgpt food extraction service")
        extraction_service = ChatGPTFoodExtractionService(
            openai_key=OPENAI_CONFIG["KEY"],
            engine=OPENAI_CONFIG["ENGINE"],
        )
    return extraction_service
