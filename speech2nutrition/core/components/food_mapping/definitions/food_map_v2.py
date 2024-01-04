from dataclasses import dataclass
from typing import Callable, List

from core.domain.entities.food import Food
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.food_nutrition_response import FoodNutritionResponse
from core.domain.entities.nutrition_information_request import DBLookupPreference


@dataclass
class RepoFoodsResponse:
    foods: List[Food]
    """ The foods returned by the repository """


@dataclass
class FoodScoreQuery:
    food: Food
    """ The food to score """
    food_description: List[str]
    """ The reported food description by the user """
    food_name: str
    """ The reported food name by the user """


FoodScoreFunction = Callable[[FoodScoreQuery], float]


@dataclass
class FoodUnitQuery:
    food: Food
    """ The food object """
    unit: str
    """ The unit reported by the user, if empty the user did not report a unit """
    amount: float
    """ The amount of the food reported by the user, if 0 the user did not report a unit """


@dataclass
class FoodUnitResponse:
    amount: float
    """
    The new amount of food in the unit given by the food portion reference unit
    """
    unit_was_transformed: bool
    """
    Whether the unit was transformed from the user's unit to the 
    food portion reference unit
    """
    # TODO: instead of a boolean flag, we should return an object with data about
    # the transformation, so the user can see how the amount was transformed


FoodUnitFunction = Callable[[FoodUnitQuery], FoodUnitResponse]

MapFoodToNutritionDBComponentV2 = Callable[
    [FoodNutritionRequest, DBLookupPreference, str], FoodNutritionResponse
]
"""
Given the food information reported by the user, the lookup preference and the app user id, map it to a food record in the nutrition database
"""
