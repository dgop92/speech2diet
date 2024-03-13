from enum import Enum
from typing import List

from pydantic import BaseModel


class FoodSource(str, Enum):
    user_db = "user_db"
    system_db = "system_db"


# Note all macro nutrients are in grams
class Food(BaseModel):
    id: str
    """ The id from the source database """
    food_name: str
    """ The main name of the food """
    other_names: List[str]
    """ Other possible names that the food is known as """
    description: List[str]
    """ Attributes that describes the food, such cooked, raw, etc """
    full_description: List[str]
    """ The full description of the food, including the food name and the description. Each item in the list is is clean using NLP techniques"""
    portion_size: float
    """ For USDA Foundation food reference units are in grams"""
    portion_size_unit: str
    """ The unit of the portion reference """
    serving_size: float
    """ The recommended amount of food to be consumed """
    serving_size_unit: str
    """ The unit of the serving size """
    food_source: FoodSource
    """ The source of the food, either from the user database or the system database """
    calories: float
    protein: float
    fat: float
    carbohydrates: float
