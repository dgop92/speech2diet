import logging

from core.components.food_mapping.definitions.food_map_v2 import (
    FoodUnitQuery,
    FoodUnitResponse,
)

logger = logging.getLogger(__name__)

BASIC_UNITS_TO_GRAMS = {
    "g": 1,
    "gramos": 1,
    "kg": 1000,
    "kilo": 1000,
    "ml": 1,
    "mililitros": 1,
    "l": 1000,
    "litros": 1000,
    "cucharada": 15,
    "cucharadita": 5,
    "taza": 200,
}


def compute_new_amount_to_grams(query: FoodUnitQuery) -> FoodUnitResponse:
    logger.debug("checking if food portion unit is grams")
    if query.food.portion_unit != "g":
        raise ValueError(
            "Food unit is not grams, this mapping implementation only supports grams"
        )

    logger.debug("checking if user's unit can be transformed to grams")
    if query.unit not in BASIC_UNITS_TO_GRAMS:
        logger.debug(f"unit '{query.unit}' cannot be transformed to grams")
        return FoodUnitResponse(
            amount=0,
            unit_was_transformed=False,
        )

    logger.debug(f"computing new amount in grams for unit '{query.unit}'")
    new_amount = query.amount * BASIC_UNITS_TO_GRAMS[query.unit]

    return FoodUnitResponse(
        amount=new_amount,
        unit_was_transformed=True,
    )
