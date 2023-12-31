import argparse
import logging

import spacy

from config.database import MongoDatabase
from config.logging import config_logger
from core.components.food_mapping.infrastructure.repositories.clean_db_keywords import (
    clean_full_description_for_mongo_collection,
)


def main() -> None:
    # Create the argument parser
    parser = argparse.ArgumentParser(
        description="Clean full description attribute for mongo collection"
    )

    # Add arguments
    parser.add_argument("collection_name", type=str, help="Name of the collection")
    parser.add_argument(
        "full_description_attr", type=str, help="Attribute for full description"
    )
    parser.add_argument(
        "--disable-lemmatization", action="store_true", help="Disable lemmatization"
    )
    parser.add_argument(
        "--language", type=str, default="es_core_news_sm", help="Spacy language model"
    )
    parser.set_defaults(disable_lemmatization=True)

    # Parse the command-line arguments
    args = parser.parse_args()

    logger.info("loading spacy model for spanish")
    nlp = spacy.load(args.language)

    logger.info("connecting to mongo database")
    mongo_db = MongoDatabase()
    db = mongo_db.get_database()

    try:
        clean_full_description_for_mongo_collection(
            db=db,
            collection_name=args.collection_name,
            full_description_attr=args.full_description_attr,
            nlp=nlp,
            disable_lemmatization=args.disable_lemmatization,
        )
    except Exception as e:
        logger.exception("error cleaning full description for mongo collection")
    finally:
        mongo_db.close()


if __name__ == "__main__":
    config_logger()
    logger = logging.getLogger(__name__)
    logger.info("logger setup")
    main()
