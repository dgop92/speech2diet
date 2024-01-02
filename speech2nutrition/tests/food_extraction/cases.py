from typing import Dict, List

from tests.food_extraction.test_sets.basic import BASIC_TEST_SET
from tests.food_extraction.test_sets.check import CHECK_TEST_SET
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase

TEST_SETS: Dict[str, List[FoodExtractionTestCase]] = {
    "check": CHECK_TEST_SET,
    "basic": BASIC_TEST_SET,
}
