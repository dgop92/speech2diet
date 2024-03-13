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
    if query.food.portion_size_unit != "g":
        raise ValueError(
            "Food unit is not grams, this mapping implementation only supports grams"
        )

    if query.unit == "":
        if query.amount > 0:
            # case: countable foods, here amount is 'quantity'
            # ex: 1 egg, 2 apples
            amount = query.food.serving_size * query.amount

            return FoodUnitResponse(
                amount=amount,
                unit_was_transformed=True,
            )
        elif query.amount == 0:
            # case:  neither unit nor amount was reported
            # ex: 'eating rice'
            return FoodUnitResponse(
                amount=query.food.serving_size,
                unit_was_transformed=True,
            )
        else:
            raise ValueError(
                "Amount being negative is not posible if validation was done correctly"
            )
    else:
        if query.unit in BASIC_UNITS_TO_GRAMS:
            # case: unit is known and can be transformed to grams
            # ex: I ate 100g of rice, I ate a bowl of rice
            amount = query.amount * BASIC_UNITS_TO_GRAMS[query.unit]

            return FoodUnitResponse(
                amount=amount,
                unit_was_transformed=True,
            )
        else:
            # case: unit is not known, so we can't transform it to grams,
            # using serving_size as default
            # ex: I ate 1 <unknown> of rice
            # This section also includes food-dependent units.
            # ex: I ate 1 slice of bread. A slice of bread is different from a slice of cheese
            return FoodUnitResponse(
                amount=query.food.serving_size,
                unit_was_transformed=True,
            )
