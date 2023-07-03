from spacy.language import Language

from application.dk_food_mapping.core import dk_map_food_to_nutrition_db
from application.dk_food_mapping.definitions import FoodScoreQuery, FoodScoreResult
from domain.definitions.food_mapping import (
    MapFoodToNutritionDBRecord,
    NutritionRepository,
)
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse
from infrastructure.food_mapping.score_function import score_food_by_exact_fuzzy_matches


def build_map_food_to_nutrition(nlp: Language) -> MapFoodToNutritionDBRecord:
    def score_func(query: FoodScoreQuery) -> FoodScoreResult:
        return score_food_by_exact_fuzzy_matches(query, nlp)

    def map_func(
        fn_req: FoodNutritionRequest, repository: NutritionRepository
    ) -> FoodNutritionResponse:
        return dk_map_food_to_nutrition_db(fn_req, repository, score_func)

    return map_func
