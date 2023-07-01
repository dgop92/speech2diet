import uuid
from typing import Any, Dict, List

from domain.entities.food import Food


def generate_random_uuid():
    return str(uuid.uuid4())


def create_food(raw_data: Dict[str, Any]) -> Food:
    _id = raw_data.get("id", generate_random_uuid())
    food_name = raw_data.get("food_name", "")
    other_names = raw_data.get("other_names", [])
    description = raw_data.get("description", [])
    full_description = raw_data.get("full_description", [])
    portion_reference = raw_data.get("portion_reference", 100)
    portion_unit = raw_data.get("portion_unit", "g")
    food_source = raw_data.get("food_source", "system_db")
    calories = raw_data.get("calories", 0)
    protein = raw_data.get("protein", 0)
    fat = raw_data.get("fat", 0)
    carbohydrates = raw_data.get("carbohydrates", 0)
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
    return food


def create_foods(raw_data: List[Dict[str, Any]]):
    foods = []
    for item in raw_data:
        food = create_food(item)
        foods.append(food)
    return foods
