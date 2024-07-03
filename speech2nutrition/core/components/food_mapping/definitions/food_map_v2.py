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
class UnitTransformationInfo:
    original_unit: str
    """ The original unit, the reported unit by the user. if unit is empty, the user did not report a unit """
    final_unit: str
    """ The final unit, the unit given by the food portion unit """
    transformation_factor: float
    """ The factor used to transform the original unit to the final unit.
    (factor * final unit) / original unit = final amount"""


@dataclass
class FoodUnitResponse:
    amount: float
    """
    The new amount of food in the unit given by the food portion reference unit
    """
    unit_was_transformed: bool
    """
    Whether the unit was transformed from the user's unit to the
    food portion reference unit. DEPRECATED: unit transformation info should be used instead
    """
    serving_size_was_used: bool
    """
    Whether the serving size was used as the amount of the food
    """
    # TODO: instead of a boolean flag, we should return an object with data about
    # the transformation, so the user can see how the amount was transformed
    unit_transformation_info: UnitTransformationInfo | None = None
    """
    Information about the transformation of the unit
    """


FoodUnitFunction = Callable[[FoodUnitQuery], FoodUnitResponse]

MapFoodToNutritionDBComponentV2 = Callable[
    [FoodNutritionRequest, DBLookupPreference, str], FoodNutritionResponse
]
"""
Given the food information reported by the user, the lookup preference and the app user id, map it to a food record in the nutrition database
"""
