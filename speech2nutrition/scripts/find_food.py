import argparse
import logging

from config.logging import config_logger
from core.components.food_mapping.factory import food_mapping_component_factory
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.nutrition_information_request import DBLookupPreference


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
        "--description",
        type=str,
        help="Description of the food to find in the database",
        default="",
    )
    parser.add_argument(
        "--language", type=str, default="es_core_news_sm", help="Spacy language model"
    )

    # Parse the command-line arguments
    args = parser.parse_args()

    food_mapping_component = food_mapping_component_factory()
    fq_req = FoodNutritionRequest(
        food_name=args.name,
        description=args.description.split(","),
        amount=100,
        unit="g",
    )

    result = food_mapping_component(fq_req, DBLookupPreference.system_db, "test_user")
    print(result.json(indent=4, ensure_ascii=False))


if __name__ == "__main__":
    config_logger()
    logger = logging.getLogger(__name__)
    logger.info("logger setup")
    main()
