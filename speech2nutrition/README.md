# Speech 2 Nutrition

A service to convert an audio with a description of a meal into a structured list of foods with its nutritional information.

## Setup

The service was developed using Python 3.10.9

Install the dependencies:

```bash
pip install -r requirements.txt
```

## Tests

As we are using multiple external services we can not execute all tests in a single command. There is a classification

- Unit tests: tests that do not require external services

```bash
pytest -v --ignore=tests/infrastructure/external_services
```

- Integration tests: tests that require external services

```bash
pytest -v tests/infrastructure/external_services
```

- Manual tests: tests that require manual interaction

```bash
python -m tests.infrastructure.external_services.chatgpt_food_extraction
```

```bash
python -m tests.infrastructure.full_pipeline
```

## Extras

### Example of a request

```json
{
  "user_id": "user-test",
  "audio_id": "audio-meals/audio-test-2.mp3",
  "db_lookup_preference": "system-db",
  "meal_recorded_at": "2023-12-15T00:00:00"
}
```

### Example of a response

```json
{
  "raw_transcript": "hoy almorcé 100 gramos de arroz con 80 gramos de carne",
  "food_responses": [
    {
      "food_record": {
        "food": {
          "id": "2512380",
          "food_name": "arroz",
          "other_names": [],
          "description": ["integral", "grano largo", "sin enriquecer", "crudo"],
          "full_description": [
            "arroz",
            "integral",
            "grano",
            "enriquecer",
            "crudo"
          ],
          "portion_reference": 100,
          "portion_unit": "g",
          "food_source": "system_db",
          "calories": 366,
          "protein": 7,
          "fat": 3,
          "carbohydrates": 76
        },
        "score": 2.0,
        "amount": 100,
        "unit_was_transformed": true
      },
      "suggestions": [
        {
          "food": {
            "id": "2512381",
            "food_name": "arroz",
            "other_names": [],
            "description": ["blanco", "grano largo", "sin enriquecer", "crudo"],
            "full_description": [
              "arroz",
              "blanco",
              "grano",
              "enriquecer",
              "crudo"
            ],
            "portion_reference": 100,
            "portion_unit": "g",
            "food_source": "system_db",
            "calories": 359,
            "protein": 7,
            "fat": 1,
            "carbohydrates": 80
          },
          "score": 2.0,
          "amount": 100,
          "unit_was_transformed": true
        }
      ],
      "user_amount": 100,
      "user_unit": "gramos"
    },
    {
      "food_record": {
        "food": {
          "id": "746761",
          "food_name": "carne de vacuno",
          "other_names": ["carne de res", "carne de vaca"],
          "description": [
            "redondo",
            "asado",
            "deshuesado",
            "magro separable",
            "recortado a 0 de grasa",
            "selecto",
            "crudo"
          ],
          "full_description": [
            "carne vacuno",
            "carne res",
            "carne vaca",
            "redondo",
            "asado",
            "deshuesado",
            "magro separable",
            "recortado 0 grasa",
            "selecto",
            "crudo"
          ],
          "portion_reference": 100,
          "portion_unit": "g",
          "food_source": "system_db",
          "calories": 116,
          "protein": 23,
          "fat": 2,
          "carbohydrates": 0
        },
        "score": 2.0,
        "amount": 80,
        "unit_was_transformed": true
      },
      "suggestions": [
        {
          "food": {
            "id": "746758",
            "food_name": "carne de vaca",
            "other_names": ["carne de res", "carne de vaca"],
            "description": [
              "lomo",
              "asado de lomo",
              "magro separable",
              "deshuesado",
              "recortado a 0 grasa",
              "selecto",
              "cocido",
              "asado"
            ],
            "full_description": [
              "carne vaca",
              "carne res",
              "carne vaca",
              "lomo",
              "asado lomo",
              "magro separable",
              "deshuesado",
              "recortado 0 grasa",
              "selecto",
              "cocido",
              "asado"
            ],
            "portion_reference": 100,
            "portion_unit": "g",
            "food_source": "system_db",
            "calories": 168,
            "protein": 27,
            "fat": 6,
            "carbohydrates": 0
          },
          "score": 2.0,
          "amount": 80,
          "unit_was_transformed": true
        },
        {
          "food": {
            "id": "746763",
            "food_name": "carne de vacuno",
            "other_names": ["carne de res", "carne de vaca"],
            "description": [
              "lomo corto",
              "chulet\u00f3n de buey",
              "con hueso",
              "s\u00f3lo magro separable",
              "recortado a 1/8 de grasa",
              "selecci\u00f3n",
              "cocido",
              "a la parrilla"
            ],
            "full_description": [
              "carne vacuno",
              "carne res",
              "carne vaca",
              "lomo corto",
              "chulet\u00f3n buey",
              "hueso",
              "magro separable",
              "recortado 1/8 grasa",
              "selecci\u00f3n",
              "cocido",
              "parrilla"
            ],
            "portion_reference": 100,
            "portion_unit": "g",
            "food_source": "system_db",
            "calories": 212,
            "protein": 27,
            "fat": 11,
            "carbohydrates": 0
          },
          "score": 2.0,
          "amount": 80,
          "unit_was_transformed": true
        },
        {
          "food": {
            "id": "2514744",
            "food_name": "carne de vacuno",
            "other_names": ["carne de res"],
            "description": ["molida", "80% carne magra / 20% grasa", "crudo"],
            "full_description": [
              "carne vacuno",
              "carne res",
              "molida",
              "80% carne magra 20% grasa",
              "crudo"
            ],
            "portion_reference": 100,
            "portion_unit": "g",
            "food_source": "system_db",
            "calories": 243,
            "protein": 17,
            "fat": 19,
            "carbohydrates": 0
          },
          "score": 2.0,
          "amount": 80,
          "unit_was_transformed": true
        }
      ],
      "user_amount": 80,
      "user_unit": "gramos"
    }
  ],
  "food_requests": [
    {
      "food_name": "arroz",
      "description": [],
      "amount": 100,
      "unit": "gramos"
    },
    {
      "food_name": "carne",
      "description": [],
      "amount": 80,
      "unit": "gramos"
    }
  ],
  "ni_request": {
    "user_id": "user-test",
    "audio_id": "audio-meals/audio-test-2.mp3",
    "db_lookup_preference": "system-db",
    "meal_recorded_at": "2023-12-15T00:00:00"
  }
}
```
