import logging
from dataclasses import dataclass
from typing import Callable

import spacy

from application.s2t.services import Speech2TextService
from config.database import MongoDatabase
from domain.definitions import (
    FoodExtractionService,
    MapFoodToNutritionDBRecord,
    NutritionRepository,
)
from infrastructure.dev_components import (
    MockAudioStorage,
    MockFoodExtractionService,
    MockSpeech2TextToModel,
)
from infrastructure.food_mapping.factory import build_map_food_to_nutrition
from infrastructure.food_mapping.repositories import SystemNutritionRepository

logger = logging.getLogger(__name__)


@dataclass
class PipelineComponents:
    s2t_service: Speech2TextService
    food_extraction_service: FoodExtractionService
    map_food_to_nutrition_db: MapFoodToNutritionDBRecord
    user_repository: NutritionRepository
    system_repository: NutritionRepository


PipelineFactory = Callable[[], PipelineComponents]


def dev_factory() -> PipelineComponents:
    logger.info("loading spanish model for spacy")
    spacy_language = spacy.load("es_core_news_sm")

    logger.info("connecting to mongo database")
    mongo_db = MongoDatabase()
    db = mongo_db.get_database()

    logger.info("creating repositories")
    system_repository = SystemNutritionRepository(db)
    # TODO: add user repository
    user_repository = system_repository

    # note: so far we don't have audio storage, speech2text model or food extraction
    # service, so we use the mock ones
    logger.info("initializating audio storage")
    audio_storage = MockAudioStorage("audio-tests")
    logger.info("initializating speech2text model")
    speech2text_model = MockSpeech2TextToModel()
    logger.info("initializating speech2text service")
    s2t = Speech2TextService(audio_storage, speech2text_model)

    logger.info("initializating food extraction service")
    food_extraction = MockFoodExtractionService()

    logger.info("building map food to nutrition db function")
    map_food_func = build_map_food_to_nutrition(spacy_language)

    return PipelineComponents(
        s2t_service=s2t,
        food_extraction_service=food_extraction,
        map_food_to_nutrition_db=map_food_func,
        user_repository=user_repository,
        system_repository=system_repository,
    )
