import logging
from typing import List

import spacy
from pymongo import database

from infrastructure.food_mapping.clean_keyword import clean_description_keyword

logger = logging.getLogger(__name__)


def clean_full_description_for_mongo_collection(
    db: database.Database,
    collection_name: str,
    full_description_attr: str,
    disable_lemmatization: bool = True,
) -> None:
    logger.info("loading spacy model for spanish")
    nlp = spacy.load("es_core_news_sm")

    collection = db[collection_name]

    logger.info(f"retrieving all documents from collection '{collection_name}'")
    documents = collection.find()

    for doc in documents:
        logger.info(f"cleaning full description for document '{doc['_id']}'")
        full_description: List[str] = doc[full_description_attr]
        cleaned_full_description = [
            clean_description_keyword(
                nlp, keyword, disable_lemmatization=disable_lemmatization
            )
            for keyword in full_description
        ]

        # Update the document with the new attribute value
        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"cleaned_full_description": cleaned_full_description}},
        )

    logger.info(
        f"finished cleaning full description for collection '{collection_name}'"
    )
