import logging
import unittest

import pytest
import spacy
from spacy.language import Language

from core.components.food_mapping.definitions.food_map_v2 import FoodScoreQuery
from core.components.food_mapping.infrastructure.nlp.score_function import (
    score_food_by_exact_fuzzy_matches,
)
from tests.food_mapping.utils import create_food

logger = logging.getLogger(__name__)

assertions = unittest.TestCase()


@pytest.fixture(scope="module")
def nlp():
    logger.info("loading spacy model for spanish")
    return spacy.load("es_core_news_sm")


def test_score_food_by_exact_fuzzy_matches_exact_match(nlp: Language):
    """Should compute a score of 4 for two exact matches"""

    query = FoodScoreQuery(
        food=create_food({
            "full_description": ["arroz", "blanco", "cocido", "sin", "sal"]
        }),
        food_description=["blanco"],
        food_name="arroz",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 4
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_fuzzy_match(nlp: Language):
    """Should compute a score of 1 for one fuzzy match"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carnes", "grasa"]}),
        food_description=[],
        food_name="carne",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 1
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches(nlp: Language):
    """Should compute a score of 3 for one exact match and one fuzzy match"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res"]}),
        food_description=["res"],
        food_name="carnes",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 3
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_zero_match(nlp: Language):
    """Should compute a score of 0 for no match"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res"]}),
        food_description=["frito", "blanco"],
        food_name="arroz",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 0
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_multiple_words_1(nlp: Language):
    """
    Should compute a score of 4 for two exact matches where
    two matches are in the user food name
    """

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res", "ternera"]}),
        food_description=[],
        food_name="carne de ternera",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 4
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_multiple_words_2(nlp: Language):
    """
    Should compute a score of 5 for two exact matches found in the food name and
    one fuzzy match found in the user description
    """

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res", "ternera", "grasas"]}),
        food_description=["sin grasa"],
        food_name="carne de ternera",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 5
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_multiple_words_3(nlp: Language):
    """
    Should compute a score of 6 for one exact matches found in the food name and
    two exact matches found in the user description
    """
    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res", "ternera", "grasas"]}),
        food_description=["res y ternera"],
        food_name="carne",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 6
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_multiple_words_4(nlp: Language):
    """
    Should compute a score of 4 for two exact matches found in the food name
    """
    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne res", "grasa"]}),
        food_description=[""],
        food_name="carne de res",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 4
    assertions.assertEqual(score, expected_score)


def test_score_food_by_exact_fuzzy_matches_plurals(nlp: Language):
    """Should compute a score of 1 for one exact match with plural"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["judias", "cocidas", "frijoles"]}),
        food_description=[],
        food_name="frijol",
    )
    score = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 1
    assertions.assertEqual(score, expected_score)
