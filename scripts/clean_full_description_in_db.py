import argparse
import logging

from config.database import MongoDatabase
from config.logging import config_logger
from infrastructure.food_mapping.clean_db_keywords import (
    clean_full_description_for_mongo_collection,
)


def main() -> None:
    # Create the argument parser
    parser = argparse.ArgumentParser(
        description="Clean full description for mongo collection"
    )

    # Add arguments
    parser.add_argument("collection_name", type=str, help="Name of the collection")
    parser.add_argument(
        "full_description_attr", type=str, help="Attribute for full description"
    )
    parser.add_argument(
        "--disable-lemmatization", action="store_true", help="Disable lemmatization"
    )
    parser.set_defaults(disable_lemmatization=True)

    # Parse the command-line arguments
    args = parser.parse_args()

    mongo_db = MongoDatabase()
    db = mongo_db.db

    try:
        clean_full_description_for_mongo_collection(
            db=db,
            collection_name=args.collection_name,
            full_description_attr=args.full_description_attr,
            disable_lemmatization=args.disable_lemmatization,
        )
    except Exception as e:
        logger.error(e)
    finally:
        mongo_db.close()


if __name__ == "__main__":
    config_logger()
    logger = logging.getLogger(__name__)
    logger.info("logger setup")
    main()
