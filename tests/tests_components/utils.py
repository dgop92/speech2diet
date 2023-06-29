import uuid
from typing import Any, Dict, List

from domain.entities.food import Food


def generate_random_uuid():
    return str(uuid.uuid4())


def create_foods(raw_data: List[Dict[str, Any]]):
    foods = []
    for item in raw_data:
        _id = item.get("id", generate_random_uuid())
        food_name = item.get("food_name", "")
        other_names = item.get("other_names", [])
        description = item.get("description", [])
        full_description = item.get("full_description", [])
        portion_reference = item.get("portion_reference", 100)
        portion_unit = item.get("portion_unit", "g")
        food_source = item.get("food_source", "system_db")
        calories = item.get("calories", 0)
        protein = item.get("protein", 0)
        fat = item.get("fat", 0)
        carbohydrates = item.get("carbohydrates", 0)
        food = Food(
            id=_id,
            food_name=food_name,
            other_names=other_names,
            description=description,
            full_description=full_description,
            portion_reference=portion_reference,
            portion_unit=portion_unit,
            food_source=food_source,
            calories=calories,
            protein=protein,
            fat=fat,
            carbohydrates=carbohydrates,
        )
        foods.append(food)
    return foods
