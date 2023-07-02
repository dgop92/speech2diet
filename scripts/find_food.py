import argparse
import logging

import spacy

from config.database import MongoDatabase
from config.logging import config_logger
from domain.entities.food_nutrition_request import FoodNutritionRequest
from infrastructure.food_mapping.factory import build_map_food_to_nutrition
from infrastructure.food_mapping.repositories import SystemNutritionRepository


def main() -> None:
    # Create the argument parser
    parser = argparse.ArgumentParser(
        description="Find the best food which matches the given name and description"
    )

    # Add arguments
    parser.add_argument(
        "name", type=str, help="Name of the food to find in the database"
    )
    parser.add_argument(
        "description", type=str, help="Description of the food to find in the database"
    )
    parser.add_argument(
        "--language", type=str, default="es_core_news_sm", help="Spacy language model"
    )

    # Parse the command-line arguments
    args = parser.parse_args()

    logger.info("loading spacy model for spanish")
    nlp = spacy.load(args.language)

    logger.info("connecting to mongo database")
    mongo_db = MongoDatabase()
    db = mongo_db.get_database()

    repository = SystemNutritionRepository(db)
    fq_req = FoodNutritionRequest(
        food_name=args.name,
        description=args.description,
        amount=100,
        unit="g",
    )
    food_map_func = build_map_food_to_nutrition(nlp)
    result = food_map_func(fq_req, repository)
    print(result.json(indent=4))


if __name__ == "__main__":
    config_logger()
    logger = logging.getLogger(__name__)
    logger.info("logger setup")
    main()
