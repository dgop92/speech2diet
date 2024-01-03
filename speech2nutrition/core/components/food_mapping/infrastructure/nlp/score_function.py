import logging
from typing import List

import Levenshtein as lev
from spacy.language import Language

from core.components.food_mapping.definitions.food_map_v2 import FoodScoreQuery
from core.components.food_mapping.infrastructure.nlp.clean_keyword import (
    clean_description_keyword,
)

LEVENSHTIEN_THRESHOLD = 0.84


logger = logging.getLogger(__name__)


def score_food_by_exact_fuzzy_matches(
    query: FoodScoreQuery,
    nlp: Language,
) -> float:
    """
    Score the food by comparing the user's description with the target food's description

    The score is calculated by:
    - 2 points for each exact match
    - 1 point for each fuzzy match (using Levenshtein distance)

    The fuzzy match is for words that are similar but not exactly the same.
    In our case to handle accents and singular - plural forms.

    Do not use this function if you can apply better nlp techniques to handle
    accents and singular - plural forms.

    :param nlp: spacy nlp object
    :param query: FoodScoreQuery object
    :return: FoodScoreResult object

    """

    target_description = query.food.full_description
    user_description = query.food_description
    user_food_name = query.food_name

    logger.debug(f"scoring {query.food_name}")

    # is possible that a food name is composed of multiple words, e.g. "carne de res"
    cleaned_user_food_name = clean_description_keyword(nlp, user_food_name)
    food_name_description = cleaned_user_food_name.split(" ")

    cleaned_user_description = [
        clean_description_keyword(
            nlp,
            word,
        )
        for word in user_description
    ]
    # it is possible that the user description is composed of multiple words
    final_user_description: List[str] = []
    for ud in cleaned_user_description:
        final_user_description.extend(ud.split(" "))

    full_user_description = food_name_description + final_user_description

    # TODO: make sure that each description is a simple word
    final_target_description: List[str] = []
    for td in target_description:
        final_target_description.extend(td.split(" "))

    score = 0
    full_user_description_set = set(full_user_description)
    target_description_set = set(final_target_description)
    intersection = full_user_description_set.intersection(target_description_set)
    number_of_exact_matches = len(intersection)

    score += number_of_exact_matches * 2

    # remove matched words
    full_user_description = list(full_user_description_set - intersection)
    target_description = list(target_description_set - intersection)

    for ud in full_user_description:
        for td in target_description:
            if lev.ratio(ud, td) > LEVENSHTIEN_THRESHOLD:
                score += 1

    logger.debug(f"final score: {score} for {query.food_name}")
    return score
