import logging

from config.settings_v2 import APP_CONFIG
from core.components.food_extraction.factory import food_extraction_component_factory
from core.components.food_mapping.factory import food_mapping_component_factory
from core.components.speech2text.infrastructure.mocks.mock_s2t_model import (
    MockSpeech2TextToModel,
)
from core.components.speech2text.infrastructure.real.openai_whisper import (
    OpenAIWhisperSpeech2TextModel,
)
from http_demo.demo_request_handler import HTTPDemoRequestHandler

logger = logging.getLogger(__name__)


def core_factory() -> HTTPDemoRequestHandler:
    if APP_CONFIG.mock_services:
        logger.info("creating mock speech2text model")
        speech2text_model = MockSpeech2TextToModel()
    else:
        logger.info("creating openai whisper speech2text model")
        speech2text_model = OpenAIWhisperSpeech2TextModel(
            api_key=APP_CONFIG.open_ai_key
        )

    food_extraction_component = food_extraction_component_factory()
    food_mapping_component = food_mapping_component_factory()

    return HTTPDemoRequestHandler(
        speech2text_model=speech2text_model,
        food_extraction_component=food_extraction_component,
        food_mapping_component=food_mapping_component,
    )
