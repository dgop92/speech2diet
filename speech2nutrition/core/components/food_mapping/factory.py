import logging

import spacy

from config.database import MongoDatabase
from config.settings_v2 import APP_CONFIG
from core.components.food_mapping.definitions.food_map_v2 import (
    MapFoodToNutritionDBComponentV2,
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
from core.components.food_mapping.infrastructure.unit_module.simple_unit import (
    compute_new_amount_to_grams,
)
from core.components.food_mapping.map_algorithm import FoodMapper

logger = logging.getLogger(__name__)


def food_mapping_component_factory() -> MapFoodToNutritionDBComponentV2:
    logger.info("loading spanish model for spacy")
    spacy_language = spacy.load("es_core_news_sm")

    if APP_CONFIG.mock_services:
        logger.info("creating mock system repository")
        system_repository = MockNutritionRepository(data=[])
    else:
        logger.info("connecting to mongo database")
        mongo_db = MongoDatabase()

        logger.info("creating system repository")
        system_repository = SystemNutritionRepository(mongo_db)

    logger.info("creating 'map food to nutrition db' function")
    food_mapper = FoodMapper(
        system_repository=system_repository,
        score_function=lambda food: score_food_by_exact_fuzzy_matches(
            food, spacy_language
        ),
        unit_function=compute_new_amount_to_grams,
    )

    return food_mapper
