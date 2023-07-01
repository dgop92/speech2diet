from dataclasses import dataclass
from typing import Callable, List

from domain.entities.food import Food


@dataclass
class FoodScoreQuery:
    food: Food
    user_description: List[str]
    user_food_name: str


# TDOO: remove food attribute
@dataclass
class FoodScoreResult:
    food: Food
    score: float


FoodScoreFunction = Callable[[FoodScoreQuery], FoodScoreResult]


@dataclass
class FoodUnitQuery:
    food: Food
    """ The food object """
    unit: str
    """ The unit reported by the user """
    amount: float
    """ The amount of the food reported by the user """


@dataclass
class FoodUnitResult:
    amount: float
    """ The amount of the food transformed to the unit given by the food portion unit """
    unit_was_transformed: bool
    """ Whether the unit was transformed to the unit given by the food portion unit """
