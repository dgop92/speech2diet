import logging

import pytest

from infrastructure.pipeline_components.external.food_extraction.gpt import (
    ChatGPTFoodExtractionService,
)

logger = logging.getLogger(__name__)


@pytest.fixture(scope="module")
def gpt_service():
    logger.info("loading spacy model for spanish")
    return ChatGPTFoodExtractionService()


def test_basic_case(gpt_service: ChatGPTFoodExtractionService):
    text = "Estoy almorzando 100 gramos de arroz blanco"

    foods = gpt_service.extract_foods_from_text(text)
    assert len(foods) == 1


def test_empty_case(gpt_service: ChatGPTFoodExtractionService):
    text = "Se me olvidó que comí hoy"

    foods = gpt_service.extract_foods_from_text(text)
    assert len(foods) == 0
