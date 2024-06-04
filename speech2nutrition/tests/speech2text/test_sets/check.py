from typing import List

from tests.speech2text import unit_utils
from tests.speech2text.test_sets.definitions import ExpectedS2TFood

CHECK_TEST_SET: List[ExpectedS2TFood] = [
    {
        "audio_id": "check-test-case-1",
        "possible_transcription": "Estoy bebiendo 300 ml de jugo de mora con 20 gramos de arroz",
        "keywords": ["jugo", "mora", "arroz"],
        "possible_units": [*unit_utils.MILLILITERS, *unit_utils.GRAMS],
        "possible_amounts": ["300", "trescientos", "20", "veinte"],
    },
]
