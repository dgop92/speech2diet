from typing import Dict, List

from tests.food_extraction.test_sets.basic import BASIC_TEST_SET
from tests.food_extraction.test_sets.check import CHECK_TEST_SET
from tests.food_extraction.test_sets.compound import COMPOUND_TEST_SET
from tests.food_extraction.test_sets.countables import COUNTABLES_TEST_SET
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase
from tests.food_extraction.test_sets.half_units import HALF_UNITS_TEST_SET
from tests.food_extraction.test_sets.uncountables import UNCONTABLES_TEST_SET

TEST_SETS: Dict[str, List[FoodExtractionTestCase]] = {
    "check": CHECK_TEST_SET,
    "basic": BASIC_TEST_SET,
    "countables": COUNTABLES_TEST_SET,
    "uncountables": UNCONTABLES_TEST_SET,
    "compound": COMPOUND_TEST_SET,
    "half_units": HALF_UNITS_TEST_SET,
}
