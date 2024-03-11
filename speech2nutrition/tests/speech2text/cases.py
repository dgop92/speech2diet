from typing import Dict, List

from tests.speech2text.test_sets.basic_units import BASIC_UNIT_SET
from tests.speech2text.test_sets.common import COMMON_TEST_SET
from tests.speech2text.test_sets.definitions import (
    ExpectedS2TFoodKeywordsCase,
    ExpectedS2TFoodUnitAmountCase,
)

KEYWORD_TEST_SETS: Dict[str, List[ExpectedS2TFoodKeywordsCase]] = {
    "common": COMMON_TEST_SET,
}

UNIT_AMOUNT_TEST_SETS: Dict[str, List[ExpectedS2TFoodUnitAmountCase]] = {
    "basic_unit": BASIC_UNIT_SET,
}
