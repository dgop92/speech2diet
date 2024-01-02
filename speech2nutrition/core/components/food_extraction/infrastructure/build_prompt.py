import json

from core.components.food_extraction.infrastructure.prompts import (
    EXTRACTION_BASE_PROMPT,
)

examples = [
    {
        "text": "Estoy comiendo 100 gramos de arroz blanco cocido y una manzana",
        "result": [
            {
                "food_name": "arroz",
                "description": "blanco,cocido",
                "amount": 100,
                "unit": "gramos",
            },
            {"food_name": "manzana", "description": "", "amount": 1, "unit": ""},
        ],
    },
    {
        "text": "Disfruto de dos panes franceses con una taza de café negro",
        "result": [
            {"food_name": "panes", "description": "franceses", "amount": 2, "unit": ""},
            {
                "food_name": "café",
                "description": "negro",
                "amount": 100,
                "unit": "gramos",
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
