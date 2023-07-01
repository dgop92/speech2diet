import logging

import pytest
import spacy
from spacy.language import Language

from application.dk_food_mapping.definitions import FoodScoreQuery
from infrastructure.food_mapping.score_function import score_food_by_exact_fuzzy_matches
from tests.tests_components.utils import create_food

logger = logging.getLogger(__name__)


@pytest.fixture(scope="module")
def nlp():
    logger.info("loading spacy model for spanish")
    return spacy.load("es_core_news_sm")


def test_score_food_by_exact_fuzzy_matches_exact_match(nlp: Language):
    """Should compute a score of 4 for two exact matches"""

    query = FoodScoreQuery(
        food=create_food(
            {"full_description": ["arroz", "blanco", "cocido", "sin", "sal"]}
        ),
        user_description=["blanco"],
        user_food_name="arroz",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 4
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches_fuzzy_match(nlp: Language):
    """Should compute a score of 1 for one fuzzy match"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carnes", "grasa"]}),
        user_description=[],
        user_food_name="carne",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 1
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches(nlp: Language):
    """Should compute a score of 3 for one exact match and one fuzzy match"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res"]}),
        user_description=["res"],
        user_food_name="carnes",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 3
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches_zero_match(nlp: Language):
    """Should compute a score of 0 for no match"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res"]}),
        user_description=["frito", "blanco"],
        user_food_name="arroz",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 0
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches_multiple_words_1(nlp: Language):
    """
    Should compute a score of 4 for two exact matches where
    two matches are in the user food name
    """

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res", "ternera"]}),
        user_description=[],
        user_food_name="carne de ternera",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 4
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches_multiple_words_2(nlp: Language):
    """
    Should compute a score of 5 for two exact matches found in the food name and
    one fuzzy match found in the user description
    """

    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res", "ternera", "grasas"]}),
        user_description=["sin grasa"],
        user_food_name="carne de ternera",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 5
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches_multiple_words_3(nlp: Language):
    """
    Should compute a score of 6 for one exact matches found in the food name and
    two exact matches found in the user description
    """
    query = FoodScoreQuery(
        food=create_food({"full_description": ["carne", "res", "ternera", "grasas"]}),
        user_description=["res y ternera"],
        user_food_name="carne",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 6
    assert result.score == expected_score


def test_score_food_by_exact_fuzzy_matches_plurals(nlp: Language):
    """Should compute a score of 1 for one exact match with plural"""

    query = FoodScoreQuery(
        food=create_food({"full_description": ["judias", "cocidas", "frijoles"]}),
        user_description=[],
        user_food_name="frijol",
    )
    result = score_food_by_exact_fuzzy_matches(query, nlp)
    expected_score = 1
    assert result.score == expected_score
