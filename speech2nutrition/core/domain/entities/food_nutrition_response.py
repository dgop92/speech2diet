from typing import List

from pydantic import BaseModel

from core.domain.entities.food import Food


class UnitTransformationInfo(BaseModel):
    original_unit: str
    """ The original unit, the reported unit by the user. if unit is empty, the user did not report a unit """
    final_unit: str
    """ The final unit, the unit given by the food portion unit """
    transformation_factor: float
    """ The factor used to transform the original unit to the final unit. 
    (factor * final unit) / original unit = final amount"""


class FoodRecord(BaseModel):
    food: Food
    """ The food object """
    score: float
    """ The score of the food record, the higher the score the more likely the food is the correct food """
    amount: float
    """ amount in the food's portion unit. if amount is 0, then the the user's unit could not be converted to the food's portion unit"""
    unit_was_transformed: bool
    """ Whether the unit was transformed to the unit given by the food portion unit"""
    serving_size_was_used: bool
    """
    Whether the serving size was used as the amount of the food
    """
    unit_transformation_info: UnitTransformationInfo | None = None
    """
    Information about the transformation of the unit
    """


class FoodNutritionResponse(BaseModel):
    food_record: FoodRecord | None
    """ The food record that was found """
    suggestions: List[FoodRecord]
    """ A list of food records that are similar to the food request """
    user_amount: float
    """ The amount of the food that the user reported """
    user_unit: str
    """ The unit of the amount that the user reported """
