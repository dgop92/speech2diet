from dataclasses import dataclass
from typing import Callable

from application.s2t.services import Speech2TextService
from domain.definitions import (
    FoodExtractionService,
    MapFoodToNutritionDBRecord,
    NutritionRepository,
)


@dataclass
class PipelineComponents:
    s2t_service: Speech2TextService
    food_extraction_service: FoodExtractionService
    map_food_to_nutrition_db: MapFoodToNutritionDBRecord
    user_repository: NutritionRepository
    system_repository: NutritionRepository


PipelineFactory = Callable[[], PipelineComponents]
