from typing import List

from tests.speech2text import unit_utils
from tests.speech2text.test_sets.definitions import ExpectedS2TFood

BASIC_UNIT_SET: List[ExpectedS2TFood] = [
    {
        "audio_id": "basic-unit-test-case-1",
        "possible_transcription": "Estoy bebiendo 300 ml de jugo",
        "keywords": ["jugo"],
        "possible_amounts": ["300", "trescientos"],
        "possible_units": [*unit_utils.MILLILITERS],
    },
    {
        "audio_id": "basic-unit-test-case-2",
        "possible_transcription": "Estoy comiendo una taza de arroz",
        "keywords": ["arroz"],
        "possible_amounts": ["una", "1"],
        "possible_units": ["taza"],
    },
    {
        "audio_id": "basic-unit-test-case-3",
        "possible_transcription": "105 gramos de lentejas",
        "keywords": ["lentejas"],
        "possible_amounts": ["105", "ciento cinco"],
        "possible_units": [*unit_utils.GRAMS],
    },
    {
        "audio_id": "basic-unit-test-case-4",
        "possible_transcription": "Comí una libra de posta de cerdo",
        "keywords": ["posta", "cerdo"],
        "possible_amounts": ["una", "1"],
        "possible_units": [*unit_utils.POUNDS],
    },
    {
        "audio_id": "basic-unit-test-case-5",
        "possible_transcription": "Me comí dos manzanas",
        "keywords": ["manzanas"],
        "possible_amounts": ["dos", "2"],
        "possible_units": [],
    },
    {
        "audio_id": "basic-unit-test-case-6",
        "possible_transcription": "Estoy comiendo 1/4 de libra de queso",
        "keywords": ["queso"],
        "possible_amounts": ["1/4", "un cuarto", "cuarto"],
        "possible_units": [*unit_utils.POUNDS],
    },
    {
        "audio_id": "basic-unit-test-case-7",
        "possible_transcription": "2 cucharadas de salsa de tomate",
        "keywords": ["salsa", "tomate"],
        "possible_amounts": ["dos", "2"],
        "possible_units": ["cucharadas", "cda", "cdas"],
    },
    {
        "audio_id": "basic-unit-test-case-8",
        "possible_transcription": "Estoy comiendo lata y media de atún",
        "keywords": ["atún"],
        "possible_amounts": ["media", "lata"],
        "possible_units": [],
    },
    {
        "audio_id": "basic-unit-test-case-9",
        "possible_transcription": "Estoy tomando un litro de gaseosa",
        "keywords": ["gaseosa"],
        "possible_amounts": ["un", "1"],
        "possible_units": [*unit_utils.LITERS],
    },
    {
        "audio_id": "basic-unit-test-case-10",
        "possible_transcription": "Desayuno de 2 huevos y medio",
        "keywords": ["huevos"],
        "possible_amounts": ["dos", "2", "medio"],
        "possible_units": [],
    },
]
