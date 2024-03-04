import json
import logging
import unittest

import pytest

from core.tasks.usda.map_usda_data_to_comon_food_task import MapUSDADataToCommonFoodTask

logger = logging.getLogger(__name__)


assertionLib = unittest.TestCase()


@pytest.fixture
def usda_map_instance():
    usda_map_task = MapUSDADataToCommonFoodTask(logger, "test")
    return usda_map_task


def test_successful_mapping(usda_map_instance: MapUSDADataToCommonFoodTask):
    with open("tests/test_data/usda/normal1.json") as f:
        usda_data = json.load(f)
        common_foods = usda_map_instance.map_usda_data_to_common_food([usda_data])

    food = common_foods[0]
    assertionLib.assertEqual(food.food_name, "huevo")
    assertionLib.assertEqual(food.db_source_name, "usdaFoundation")
    assertionLib.assertEqual(len(food.other_names), 0)
    assertionLib.assertSetEqual(
        set(food.description), {"entero", "crudo", "congelado", "pasteurizado"}
    )
    assertionLib.assertEqual(food.serving_size, 100)
    assertionLib.assertEqual(food.serving_size_unit, "g")

    assertionLib.assertEqual(food.portion_size, 100)
    assertionLib.assertEqual(food.portion_size_unit, "g")

    assertionLib.assertEqual(food.calories, 146)
    assertionLib.assertAlmostEqual(food.protein, 12.3)
    assertionLib.assertAlmostEqual(food.fat, 10.3)
    assertionLib.assertAlmostEqual(food.carbohydrates, 0.91)


def test_other_names_attribute_should_be_empty(
    usda_map_instance: MapUSDADataToCommonFoodTask,
):
    with open("tests/test_data/usda/normal1.json") as f:
        usda_data = json.load(f)
        common_foods = usda_map_instance.map_usda_data_to_common_food([usda_data])

    food = common_foods[0]

    assertionLib.assertEqual(food.food_name, "huevo")
    assertionLib.assertSetEqual(set(food.other_names), set())


def test_other_names_attribute_should_be_not_empty(
    usda_map_instance: MapUSDADataToCommonFoodTask,
):
    with open("tests/test_data/usda/normal2.json") as f:
        usda_data = json.load(f)
        common_foods = usda_map_instance.map_usda_data_to_common_food([usda_data])

    food = common_foods[0]

    assertionLib.assertEqual(food.food_name, "frijoles")
    assertionLib.assertSetEqual(set(food.other_names), {"alubias"})


def test_should_ignore_invalid_food_from_final_list(
    usda_map_instance: MapUSDADataToCommonFoodTask,
):
    with open("tests/test_data/usda/bad_structure.json") as f:
        usda_data = json.load(f)
        common_foods = usda_map_instance.map_usda_data_to_common_food(usda_data)

    # There is one food item that does not have the required fields,
    # so it should be ignored
    assertionLib.assertEqual(len(common_foods), 1)
