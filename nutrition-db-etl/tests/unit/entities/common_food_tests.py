import logging
import unittest
from typing import Dict

from pydantic import ValidationError

from core.entities.common_food import CommonFood

logger = logging.getLogger(__name__)


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


class CommonFoodTests(unittest.TestCase):

    def test_valid_id_structure(self):

        data = {
            "db_source_name": "testSource",
            "food_name": "potato",
            "food_names": ["potato"],
            "other_names": [],
            "description": ["test"],
            **basic_portion_serving_data(),
            **basic_nutrition_data(),
        }
        common_food = CommonFood(**data)
        self.assertTrue("/" in common_food.id)
        id_splitted = common_food.id.split("/")
        # Check if the id is in the format source/uuid
        self.assertEqual(id_splitted[0], "testSource")
        self.assertTrue(len(id_splitted[1]) > 0)

    def test_db_source_name_shoud_not_contain_slashes(self):
        data = {
            "db_source_name": "test/Source",
            "food_name": "potato",
            "food_names": ["potato"],
            "other_names": [],
            "description": ["test"],
            **basic_portion_serving_data(),
            **basic_nutrition_data(),
        }
        with self.assertRaises(ValidationError):
            CommonFood(**data)

    def test_serving_and_portion_size_should_have_same_unit(self):
        data = {
            "db_source_name": "testSource",
            "food_name": "potato",
            "food_names": ["potato"],
            "other_names": [],
            "description": ["test"],
            "serving_size": 50,
            "serving_size_unit": "g",
            "portion_size": 100,
            "portion_size_unit": "ml",
            **basic_nutrition_data(),
        }
        with self.assertRaises(ValidationError):
            CommonFood(**data)

    def test_description_elements_should_not_be_empty(self):
        data = {
            "db_source_name": "testSource",
            "food_name": "potato",
            "food_names": ["potato"],
            "other_names": [],
            "description": ["", "cooked"],
            **basic_portion_serving_data(),
            **basic_nutrition_data(),
        }
        with self.assertRaises(ValidationError):
            CommonFood(**data)

    def test_other_names_elements_should_not_be_empty(self):
        data = {
            "db_source_name": "testSource",
            "food_name": "meat",
            "food_names": ["meat"],
            "other_names": ["", "beef"],
            "description": ["test"],
            **basic_portion_serving_data(),
            **basic_nutrition_data(),
        }
        with self.assertRaises(ValidationError):
            CommonFood(**data)
