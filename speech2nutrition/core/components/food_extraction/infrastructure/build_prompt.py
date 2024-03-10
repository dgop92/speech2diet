import json

from core.components.food_extraction.infrastructure.prompts import (
    EXTRACTION_BASE_PROMPT,
)

examples = [
    {
        "text": "Estoy comiendo 100 gramos de arroz blanco cocido y una pera",
        "result": [
            {
                "food_name": "arroz blanco",
                "description": "cocido",
                "amount": 100,
                "unit": "gramos",
            },
            {"food_name": "pera", "description": "", "amount": 1, "unit": ""},
        ],
    },
    {
        "text": "Disfruto de dos croquetas de pollo con una taza de café negro",
        "result": [
            {
                "food_name": "croquetas de pollo",
                "description": "",
                "amount": 2,
                "unit": "",
            },
            {
                "food_name": "café negro",
                "description": "",
                "amount": 1,
                "unit": "taza",
            },
        ],
    },
    {
        "text": "Mi cena de hoy fueron espaguetis",
        "result": [
            {"food_name": "espaguetis", "description": "", "amount": 0, "unit": ""},
        ],
    },
    {
        "text": "Han sido días difíciles y estoy comiendo lata y media de atún",
        "result": [
            {"food_name": "atún", "description": "", "amount": 1.5, "unit": "lata"},
        ],
    },
    {
        "text": "Hoy almorzé 50G carne de conejo asada, acompañado de un croissant",
        "result": [
            {
                "food_name": "carne de conejo",
                "description": "asada",
                "amount": 50,
                "unit": "g",
            },
            {
                "food_name": "croissant",
                "description": "",
                "amount": 1,
                "unit": "",
            },
        ],
    },
    {
        "text": "Tengo que limpiar mi teclado que está un poco sucio",
        "result": [],
    },
]


def get_extraction_prompt(text_fragment: str):
    example_list = []
    for e in examples:
        s = f"{e['text']}\n{json.dumps(e['result'], ensure_ascii=False)}"
        example_list.append(s)

    examples_as_str = "\n".join(example_list)

    final_prompt = EXTRACTION_BASE_PROMPT.format(
        EXAMPLES=examples_as_str, TEXT_FRAGMENT=text_fragment
    )
    return final_prompt
