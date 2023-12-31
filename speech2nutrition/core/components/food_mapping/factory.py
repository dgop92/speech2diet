import logging
from typing import Tuple

import spacy
from spacy.language import Language

from config.database import MongoDatabase
from config.settings import MOCK_SERVICES
from core.components.food_mapping.application.dk_algorithm import (
    dk_map_food_to_nutrition_db,
)
from core.components.food_mapping.definitions import (
    FoodScoreQuery,
    FoodScoreResult,
    MapFoodToNutritionDBComponent,
    NutritionRepository,
)
from core.components.food_mapping.infrastructure.nlp.score_function import (
    score_food_by_exact_fuzzy_matches,
)
from core.components.food_mapping.infrastructure.repositories.mock_repository import (
    MockNutritionRepository,
)
from core.components.food_mapping.infrastructure.repositories.mongo_repository import (
    SystemNutritionRepository,
)
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.food_nutrition_response import FoodNutritionResponse

logger = logging.getLogger(__name__)


def build_map_food_to_nutrition(nlp: Language) -> MapFoodToNutritionDBComponent:
    def score_func(query: FoodScoreQuery) -> FoodScoreResult:
        return score_food_by_exact_fuzzy_matches(query, nlp)

    def map_func(
        fn_req: FoodNutritionRequest, repository: NutritionRepository
    ) -> FoodNutritionResponse:
        return dk_map_food_to_nutrition_db(fn_req, repository, score_func)

    return map_func


def food_mapping_component_factory() -> MapFoodToNutritionDBComponent:
    logger.info("loading spanish model for spacy")
    spacy_language = spacy.load("es_core_news_sm")

    logger.info("creating 'map food to nutrition db' function")
    map_food_func = build_map_food_to_nutrition(spacy_language)

    return map_food_func


def repositories_component_factory() -> Tuple[NutritionRepository, NutritionRepository]:
    if MOCK_SERVICES:
        logger.info("creating mock system repository")
        system_repository = MockNutritionRepository(data=[])
    else:
        logger.info("connecting to mongo database")
        mongo_db = MongoDatabase()

        logger.info("creating system repository")
        system_repository = SystemNutritionRepository(mongo_db)

    # TODO: add user repository
    logger.info("creating user repository")
    user_repository = system_repository

    return system_repository, user_repository
