import uuid
from typing import Any, Dict, List

from application.dk_food_mapping.definitions import FoodScoreQuery, FoodScoreResult
from domain.definitions.food_mapping import NutritionRepository
from domain.entities.food import Food
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse, FoodRecord


def map_food_using_first_element(
    fn_req: FoodNutritionRequest, repository: NutritionRepository
) -> FoodNutritionResponse:
    possible_foods = repository.get_foods_by_name(fn_req.food_name)
    if len(possible_foods) == 0:
        return FoodNutritionResponse(
            food_record=None,
            suggestions=[],
            user_amount=fn_req.amount,
            user_unit=fn_req.unit,
        )

    return FoodNutritionResponse(
        food_record=FoodRecord(
            food=possible_foods[0],
            score=1,
            amount=0,
            unit_was_transformed=False,
        ),
        suggestions=[],
        user_amount=fn_req.amount,
        user_unit=fn_req.unit,
    )


def score_food_by_exact_match(query: FoodScoreQuery) -> FoodScoreResult:
    target_description = query.food.full_description

    user_description = query.user_description
    full_user_description = [query.user_food_name] + user_description

    number_of_matches = len(
        set(full_user_description).intersection(set(target_description))
    )
    return FoodScoreResult(
        food=query.food,
        score=number_of_matches,
    )


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
