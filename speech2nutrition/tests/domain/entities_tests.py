import logging
import unittest

from pydantic import ValidationError

from core.domain.entities.food_nutrition_request import FoodNutritionRequest

logger = logging.getLogger(__name__)


class FoodNutritionRequestDataModelTests(unittest.TestCase):
    def test_successfully_parse_data(self):
        json_data = """
        {
            "food_name": "arroz",
            "description": "blanco, cocido",
            "amount": 100,
            "unit": "gramos"
        }
        """
        parsed_data = FoodNutritionRequest.parse_raw(json_data)
        self.assertEqual(parsed_data.food_name, "arroz")
        self.assertEqual(parsed_data.description, ["blanco", "cocido"])
        self.assertEqual(parsed_data.amount, 100)
        self.assertEqual(parsed_data.unit, "gramos")

    def test_empty_description(self):
        json_data = """
        {
            "food_name": "arroz",
            "description": "",
            "amount": 100,
            "unit": "gramos"
        }
        """
        parsed_data = FoodNutritionRequest.parse_raw(json_data)
        self.assertEqual(parsed_data.description, [])

    def test_food_name_cannot_be_empty(self):
        json_data = """
        {
            "food_name": "",
            "description": "blanco, cocido",
            "amount": 100,
            "unit": "gramos"
        }
        """
        with self.assertRaises(ValidationError) as context:
            FoodNutritionRequest.parse_raw(json_data)

        error = context.exception.errors()[0]
        self.assertEqual(error["msg"], "food_name cannot be empty")
        self.assertEqual(error["type"], "value_error")
        self.assertEqual(error["loc"][0], "food_name")

    def test_amount_must_be_positive(self):
        json_data = """
        {
            "food_name": "arroz",
            "description": "blanco, cocido",
            "amount": -10,
            "unit": "gramos"
        }
        """
        with self.assertRaises(ValidationError) as context:
            FoodNutritionRequest.parse_raw(json_data)

        error = context.exception.errors()[0]
        self.assertEqual(error["msg"], "amount must be positive")
        self.assertEqual(error["type"], "value_error")
        self.assertEqual(error["loc"][0], "amount")
