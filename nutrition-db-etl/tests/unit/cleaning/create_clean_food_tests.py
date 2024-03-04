import logging
import unittest
from typing import Callable, Dict

import pytest
import spacy

from core.entities.common_food import CommonFood
from core.lib.nlp.clean_keyword import clean_keyword
from core.tasks.common.create_clean_food_task import CreateCleanFoodTask

logger = logging.getLogger(__name__)


assertionLib = unittest.TestCase()


@pytest.fixture(scope="module")
def clean_func():
    logger.info("loading spacy model for spanish")
    nlp = spacy.load("es_core_news_sm")

    def clean_func(text: str) -> str:
        return clean_keyword(nlp, text)

    return clean_func


@pytest.fixture
def clean_food_instance(clean_func: Callable[[str], str]):
    usda_map_task = CreateCleanFoodTask(logger, "test", clean_func)
    return usda_map_task


def basic_nutrition_data() -> Dict[str, float]:
    return {
        "calories": 1,
        "protein": 1,
        "fat": 1,
        "carbohydrates": 1,
    }


def basic_portion_serving_data() -> Dict[str, float | str]:
    return {
        "serving_size": 1,
        "serving_size_unit": "test",
        "portion_size": 1,
        "portion_size_unit": "test",
    }


def test_search_keywords_attribute_without_other_names(
    clean_food_instance: CreateCleanFoodTask,
):
    data = {
        "db_source_name": "testSource",
        "food_name": "papa",
        "other_names": [],
        "description": ["cocinada"],
        **basic_portion_serving_data(),
        **basic_nutrition_data(),
    }
    common_food = CommonFood(**data)
    clean_foods = clean_food_instance.create_clean_food([common_food])
    clean_food = clean_foods[0]

    assertionLib.assertEqual(len(clean_food.search_keywords), 2)


def test_search_keywords_attribute_with_other_names(
    clean_food_instance: CreateCleanFoodTask,
):
    data = {
        "db_source_name": "testSource",
        "food_name": "papa",
        "other_names": ["patata"],
        "description": ["cocinada"],
        **basic_portion_serving_data(),
        **basic_nutrition_data(),
    }
    common_food = CommonFood(**data)
    clean_foods = clean_food_instance.create_clean_food([common_food])
    clean_food = clean_foods[0]

    assertionLib.assertEqual(len(clean_food.search_keywords), 3)
