from typing import List

from pydantic import BaseModel

from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse
from domain.entities.nutrition_information_request import NutritionInformationRequest


class NutritionInformationResponse(BaseModel):
    raw_transcript: str
    food_responses: List[FoodNutritionResponse]
    food_requests: List[FoodNutritionRequest]
    ni_request: NutritionInformationRequest
