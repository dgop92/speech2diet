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
        "text": "Disfruto de dos piernas de pollo asada y sin grasa con una taza de café negro",
        "result": [
            {
                "food_name": "piernas de pollo",
                "description": "asada, sin grasa",
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
        "text": "Han sido días difíciles y estoy comiendo una lata de atún",
        "result": [
            {"food_name": "lata de atún", "description": "", "amount": 1, "unit": ""},
        ],
    },
    {
        "text": "Hoy almorzé una libra y media de carne de conejo frita, acompañado de medio croissant",
        "result": [
            {
                "food_name": "carne de conejo",
                "description": "frita",
                "amount": 1.5,
                "unit": "lb",
            },
            {
                "food_name": "croissant",
                "description": "",
                "amount": 0.5,
                "unit": "",
            },
        ],
    },
    {
        "text": "Desayuné 3 laminas de queso y dos vasos de jugo de naranja",
        "result": [
            {
                "food_name": "laminas de queso",
                "description": "",
                "amount": 3,
                "unit": "",
            },
            {
                "food_name": "jugo de naranja",
                "description": "",
                "amount": 2,
                "unit": "vaso",
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
