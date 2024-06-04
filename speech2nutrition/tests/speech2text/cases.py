from typing import Dict, List

from tests.speech2text.test_sets.basic_units import BASIC_UNIT_SET
from tests.speech2text.test_sets.check import CHECK_TEST_SET
from tests.speech2text.test_sets.common import COMMON_TEST_SET
from tests.speech2text.test_sets.definitions import ExpectedS2TFood

TEST_SETS: Dict[str, List[ExpectedS2TFood]] = {
    "check": CHECK_TEST_SET,
    "basic_unit": BASIC_UNIT_SET,
    "common": COMMON_TEST_SET,
}
