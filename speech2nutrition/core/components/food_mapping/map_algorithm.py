import logging
from typing import List

from core.components.food_mapping.application.food_finder import (
    find_foods_by_preference,
)
from core.components.food_mapping.definitions.food_map_v2 import (
    FoodScoreFunction,
    FoodScoreQuery,
    FoodUnitFunction,
    FoodUnitQuery,
)
from core.components.food_mapping.definitions.repository import NutritionRepository
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.food_nutrition_response import (
    FoodNutritionResponse,
    FoodRecord,
)
from core.domain.entities.nutrition_information_request import DBLookupPreference

logger = logging.getLogger(__name__)


class FoodMapper:
    def __init__(
        self,
        system_repository: NutritionRepository,
        score_function: FoodScoreFunction,
        unit_function: FoodUnitFunction,
    ) -> None:
        self.system_repository = system_repository
        self.score_function = score_function
        self.unit_function = unit_function

    def __call__(
        self,
        request: FoodNutritionRequest,
        lookup_preference: DBLookupPreference,
        app_user_id: str,
    ) -> FoodNutritionResponse:
        # TODO: create the real user repository using the app_user_id,
        #  for now we will use the system repository
        logger.info(f"creating user repository for user {app_user_id}")
        user_repository = self.system_repository

        repo_foods_response = find_foods_by_preference(
            request, lookup_preference, self.system_repository, user_repository
        )

        if len(repo_foods_response.foods) == 0:
            logger.debug(f"no foods found with name {request.food_name}")
            return FoodNutritionResponse(
                food_record=None,
                suggestions=[],
                user_amount=request.amount,
                user_unit=request.unit,
            )

        logger.debug(f"scoring the {len(repo_foods_response.foods)} foods found")
        scores = [
            self.score_function(
                FoodScoreQuery(
                    food=food,
                    food_description=request.description,
                    food_name=request.food_name,
                )
            )
            for food in repo_foods_response.foods
        ]

        logger.debug("creating the food records without unit information")
        food_records: List[FoodRecord] = []
        for food, score in zip(repo_foods_response.foods, scores):
            food_records.append(
                FoodRecord(
                    food=food,
                    score=score,
                    amount=0,
                    unit_was_transformed=False,
                )
            )

        logger.debug("sorting the food records")
        sorted_food_records = sorted(food_records, key=lambda x: x.score, reverse=True)
        best_food_records = sorted_food_records[:4]

        # we compute the new amount just for the best food records. This way we
        # avoid computing the new amount for uninteresting foods
        unit_responses = [
            self.unit_function(
                FoodUnitQuery(
                    food=food_record.food,
                    unit=request.unit,
                    amount=request.amount,
                )
            )
            for food_record in best_food_records
        ]

        final_food_records: List[FoodRecord] = []
        for food_record, unit_response in zip(best_food_records, unit_responses):
            final_food_records.append(
                FoodRecord(
                    food=food_record.food,
                    score=food_record.score,
                    amount=unit_response.amount,
                    unit_was_transformed=unit_response.unit_was_transformed,
                )
            )

        best_match = final_food_records[0]
        suggestions = final_food_records[1:4]

        return FoodNutritionResponse(
            food_record=best_match,
            suggestions=suggestions,
            user_amount=request.amount,
            user_unit=request.unit,
        )
