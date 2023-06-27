from typing import Protocol

from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse
from domain.entities.nutrition_information_request import DBLookupPreference


class FoodMappingService(Protocol):
    def map_food_to_nutrition_db_record(
        self,
        fn_req: FoodNutritionRequest,
        user_id: str,
        preference: DBLookupPreference,
    ) -> FoodNutritionResponse:
        """
        Extract food names with its corresponding description, amount and unit from a text

        Parameters
        ----------
        text : str
            The text to extract the food names from

        Returns
        -------
        List[FoodNutritionRequest]
            A list of FoodNutritionRequest objects
        """
        ...
