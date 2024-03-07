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

    if query.unit == "":
        if query.amount > 0:
            # case: countable foods, here amount is 'quantity'
            amount = query.food.portion_reference * query.amount

            return FoodUnitResponse(
                amount=amount,
                unit_was_transformed=True,
            )
        elif query.amount == 0:
            # case:  neither unit nor amount was reported
            return FoodUnitResponse(
                amount=query.food.portion_reference,
                unit_was_transformed=True,
            )
        else:
            raise ValueError(
                "Amount being negative is not posible if validation was done correctly"
            )
    else:
        if query.unit in BASIC_UNITS_TO_GRAMS:
            # case: unit is known and can be transformed to grams
            amount = query.amount * BASIC_UNITS_TO_GRAMS[query.unit]

            return FoodUnitResponse(
                amount=amount,
                unit_was_transformed=True,
            )
        else:
            # case unit is not known, so we can't transform it to grams,
            # using portion_reference
            return FoodUnitResponse(
                amount=query.food.portion_reference,
                unit_was_transformed=True,
            )
