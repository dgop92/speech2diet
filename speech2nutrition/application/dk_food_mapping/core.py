import logging

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

logger = logging.getLogger(__name__)


def compute_new_amount_given_user_unit(query: FoodUnitQuery) -> FoodUnitResult:
    logger.debug("checking if food portion unit is grams")
    if query.food.portion_unit != "g":
        raise ValueError(
            "Food unit is not grams, this mapping implementation only supports grams"
        )

    logger.debug("checking if user's unit can be transformed to grams")
    if query.unit not in BASIC_UNITS_TO_GRAMS:
        logger.debug(f"unit '{query.unit}' cannot be transformed to grams")
        return FoodUnitResult(
            amount=0,
            unit_was_transformed=False,
        )

    logger.debug(f"computing new amount in grams for unit '{query.unit}'")
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
    logger.debug(f"retrieving foods with name {fn_req.food_name}")
    possible_foods = repository.get_foods_by_name(fn_req.food_name)

    if len(possible_foods) == 0:
        logger.debug(f"no foods found with name {fn_req.food_name}")
        return FoodNutritionResponse(
            food_record=None,
            suggestions=[],
            user_amount=fn_req.amount,
            user_unit=fn_req.unit,
        )

    logger.debug(
        f"number of foods found with name {fn_req.food_name}: {len(possible_foods)}"
    )
    logger.debug(f"scoring foods with name {fn_req.food_name}")

    score_results = [
        score_func(
            FoodScoreQuery(
                food=food,
                user_description=fn_req.description,
                user_food_name=fn_req.food_name,
            )
        )
        for food in possible_foods
    ]

    # the first is the best match, the three that follow are the suggestions
    logger.debug(f"sorting foods with name {fn_req.food_name}")
    sorted_results = sorted(score_results, key=lambda x: x.score, reverse=True)
    best_match = sorted_results[0]
    suggestions = sorted_results[1:4]

    logger.debug(f"computing new amount for unit {fn_req.unit}")
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

    logger.debug(f"best match food id: {best_match.food.id}")
    logger.debug(f"number of suggestions: {len(suggestions)}")

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
