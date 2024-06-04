from typing import List

from tests.speech2text import unit_utils
from tests.speech2text.test_sets.definitions import ExpectedS2TFood

# Note: we specify the id manually instead of using the index,
# to gain flexibility in the future.

# as this test set focus on food names we only include the unit and quantities of the first food

COMMON_TEST_SET: List[ExpectedS2TFood] = [
    {
        "audio_id": "common-keyword-test-case-2",
        "possible_transcription": "Estoy comiendo una taza de arroz de coco con un filete de 50 g de salmón",
        "keywords": ["arroz", "coco", "filete", "salmón"],
        "possible_amounts": ["una", "1"],
        "possible_units": ["taza"],
    },
    {
        "audio_id": "common-keyword-test-case-3",
        "possible_transcription": "Mi cena fue algo simple lentejas con pechuga de pollo",
        "keywords": ["lentejas", "pechuga", "pollo"],
        "possible_amounts": [],
        "possible_units": [],
    },
    {
        "audio_id": "common-keyword-test-case-4",
        "possible_transcription": "Bueno creo que comí 50 gramos huevos revueltos con 200 ML de leche",
        "keywords": ["huevos", "revueltos", "leche"],
        "possible_amounts": ["50", "cincuenta"],
        "possible_units": [*unit_utils.GRAMS],
    },
    {
        "audio_id": "common-keyword-test-case-5",
        "possible_transcription": "Me comí una manzana",
        "keywords": ["manzana"],
        "possible_amounts": ["una", "1"],
        "possible_units": [],
    },
    {
        "audio_id": "common-keyword-test-case-6",
        "possible_transcription": "Me estoy comiendo una barra de chocolate oscuro",
        "keywords": ["barra", "chocolate", "oscuro"],
        "possible_amounts": ["una", "1"],
        "possible_units": [],
    },
    {
        "audio_id": "common-keyword-test-case-7",
        "possible_transcription": "La tortilla de maíz está deliciosa",
        "keywords": ["tortilla", "maíz"],
        "possible_amounts": [],
        "possible_units": [],
    },
    {
        "audio_id": "common-keyword-test-case-8",
        "possible_transcription": "Disfrutar un helado de vainilla",
        "keywords": ["helado", "vainilla"],
        "possible_amounts": [],
        "possible_units": [],
    },
    {
        "audio_id": "common-keyword-test-case-9",
        "possible_transcription": "Carne de cerdo con 20 g de pasta",
        "keywords": ["carne", "cerdo", "pasta"],
        "possible_amounts": ["20", "veinte"],
        "possible_units": [*unit_utils.GRAMS],
    },
    {
        "audio_id": "common-keyword-test-case-10",
        "possible_transcription": "El almuerzo fue una libra de posta de cerdo Con 40G de papas a la francesa",
        "keywords": ["almuerzo", "posta", "cerdo", "papas", "francesa"],
        "possible_amounts": ["una", "1"],
        "possible_units": [*unit_utils.POUNDS],
    },
]
