from typing import List

from application.dk_food_mapping.definitions import FoodScoreQuery, FoodScoreResult
from domain.definitions.food_mapping import NutritionRepository
from domain.entities.food import Food
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse


class MockNutritionRepository:
    def __init__(self, data: List[Food]):
        self.data = data

    def get_foods_by_name(self, name: str) -> List[Food]:
        """
        Get a list of foods by its name or other names
        """
        results: List[Food] = []
        for food in self.data:
            possible_names = [food.food_name] + food.other_names
            lower_names = [n.lower() for n in possible_names]
            if name.lower() in lower_names:
                results.append(food)

        return results


def map_food_first_element_or_none(
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
        food_record=possible_foods[0],
        suggestions=possible_foods[1:],
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
