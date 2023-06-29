from application.dk_food_mapping.definitions import (
    FoodScoreFunction,
    FoodScoreQuery,
    FoodUnitQuery,
    FoodUnitResult,
)
from application.dk_food_mapping.unit_constants import BASIC_UNITS_TO_GRAMS
from domain.definitions.food_mapping import NutritionRepository
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse, FoodRecord


def compute_new_amount_given_user_unit(query: FoodUnitQuery) -> FoodUnitResult:
    if query.food.unit != "g":
        raise ValueError(
            "Food unit is not grams, this mapping implementation only supports grams"
        )

    if query.unit not in BASIC_UNITS_TO_GRAMS:
        return FoodUnitResult(
            amount=0,
            unit_was_transformed=False,
        )

    new_amount = query.amount * BASIC_UNITS_TO_GRAMS[query.unit]

    return FoodUnitResult(
        amount=new_amount,
        unit_was_transformed=True,
    )


def dk_map_food_to_nutrition_db(
    fn_req: FoodNutritionRequest,
    repository: NutritionRepository,
    score_func: FoodScoreFunction,
) -> FoodNutritionResponse:
    """
    Given the food information reported by the user, map it to a food record in the nutrition database

    This strategy will rank the foods based on how many matches/fuzzy matches are
    found between the user's reported description and the food's record description.
    """
    possible_foods = repository.get_foods_by_name(fn_req.food_name)
    if len(possible_foods) == 0:
        return FoodNutritionResponse(
            food_record=None,
            suggestions=[],
            user_amount=fn_req.amount,
            user_unit=fn_req.unit,
        )

    score_results = [
        score_func(
            FoodScoreQuery(
                food=food,
                description=food.description,
            )
        )
        for food in possible_foods
    ]

    # the first is the best match, the three that follow are the suggestions
    sorted_results = sorted(score_results, key=lambda x: x.score, reverse=True)
    best_match = sorted_results[0]
    suggestions = sorted_results[1:4]

    best_match_unit_result = compute_new_amount_given_user_unit(
        FoodUnitQuery(
            food=best_match.food,
            unit=fn_req.unit,
            amount=fn_req.amount,
        )
    )
    suggestions_unit_results = [
        compute_new_amount_given_user_unit(
            FoodUnitQuery(
                food=suggestion.food,
                unit=fn_req.unit,
                amount=fn_req.amount,
            )
        )
        for suggestion in suggestions
    ]

    best_match_food_record = FoodRecord(
        food=best_match.food,
        score=best_match.score,
        amount=best_match_unit_result.amount,
        unit_was_transformed=best_match_unit_result.unit_was_transformed,
    )
    suggestion_food_records = [
        FoodRecord(
            food=suggestion.food,
            score=suggestion.score,
            amount=suggestion_unit_result.amount,
            unit_was_transformed=suggestion_unit_result.unit_was_transformed,
        )
        for suggestion, suggestion_unit_result in zip(
            suggestions, suggestions_unit_results
        )
    ]

    return FoodNutritionResponse(
        food_record=best_match_food_record,
        suggestions=suggestion_food_records,
        user_amount=fn_req.amount,
        user_unit=fn_req.unit,
    )
