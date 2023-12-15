import logging

import spacy

from application.s2t.services import Speech2TextService
from config.database import MongoDatabase
from infrastructure.factories.common import PipelineComponents
from infrastructure.food_mapping.factory import build_map_food_to_nutrition
from infrastructure.pipeline_components.external import (
    ChatGPTFoodExtractionService,
    DeepgramWhisperSpeech2TextToModel,
    S3AudioStorage,
    SystemNutritionRepository,
)

logger = logging.getLogger(__name__)


def real_factory() -> PipelineComponents:
    """
    Create a real factory using the external services
    """

    logger.info("loading spanish model for spacy")
    spacy_language = spacy.load("es_core_news_sm")

    logger.info("creating repositories")
    logger.info("connecting to mongo database")
    mongo_db = MongoDatabase()

    system_repository = SystemNutritionRepository(mongo_db)
    # TODO: add user repository
    user_repository = system_repository

    logger.info("initializating audio storage")
    audio_storage = S3AudioStorage()
    logger.info("initializating speech2text model")
    speech2text_model = DeepgramWhisperSpeech2TextToModel()
    logger.info("initializating food extraction service")
    food_extraction = ChatGPTFoodExtractionService()

    logger.info("initializating speech2text service")
    s2t = Speech2TextService(audio_storage, speech2text_model)

    logger.info("building map food to nutrition db function")
    map_food_func = build_map_food_to_nutrition(spacy_language)

    return PipelineComponents(
        s2t_service=s2t,
        food_extraction_service=food_extraction,
        map_food_to_nutrition_db=map_food_func,
        user_repository=user_repository,
        system_repository=system_repository,
    )
