from typing import List

from pydantic import BaseModel

from core.domain.entities.food import Food


class FoodRecord(BaseModel):
    food: Food
    """ The food object """
    score: float
    """ The score of the food record, the higher the score the more likely the food is the correct food """
    amount: int
    """ amount in the food's portion unit. if amount is 0, then the the user's unit could not be converted to the food's portion unit"""
    unit_was_transformed: bool
    """ Whether the unit was transformed to the unit given by the food portion unit"""


class FoodNutritionResponse(BaseModel):
    food_record: FoodRecord | None
    """ The food record that was found """
    suggestions: List[FoodRecord]
    """ A list of food records that are similar to the food request """
    user_amount: int
    """ The amount of the food that the user reported """
    user_unit: str
    """ The unit of the amount that the user reported """
