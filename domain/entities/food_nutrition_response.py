from typing import List

from pydantic import BaseModel

from domain.entities.food import Food


class FoodRecord(BaseModel):
    food: Food
    score: float
    amount: int
    user_amount: int
    user_unit: str


class FoodNutritionResponse(BaseModel):
    food_record: FoodRecord | None
    suggestions: List[FoodRecord]
