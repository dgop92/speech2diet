from core.components.food_extraction.definitions import ExtractFoodComponent
from core.components.food_mapping.definitions import (
    MapFoodToNutritionDBComponent,
    NutritionRepository,
)
from core.components.speech2text.definitions import Speech2TextComponent
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.food_nutrition_response import FoodNutritionResponse
from core.domain.entities.nutrition_information_request import (
    DBLookupPreference,
    NutritionInformationRequest,
)
from core.domain.entities.nutrition_information_response import (
    NutritionInformationResponse,
)


class RequestHandler:
    def __init__(
        self,
        s2t_component: Speech2TextComponent,
        food_extraction_component: ExtractFoodComponent,
        food_mapping_component: MapFoodToNutritionDBComponent,
        system_repository: NutritionRepository,
        user_repository: NutritionRepository,
    ) -> None:
        self.s2t_component = s2t_component
        self.food_extraction_component = food_extraction_component
        self.food_mapping_component = food_mapping_component
        self.system_repository = system_repository
        self.user_repository = user_repository

    def map_food_in_repositories(
        self, food_request: FoodNutritionRequest, lookup_preference: DBLookupPreference
    ) -> FoodNutritionResponse:
        # TODO: collect suggestions from both user and system db if the food is not found

        if lookup_preference == DBLookupPreference.user_db_system_db:
            user_food_response = self.food_mapping_component(
                food_request, self.user_repository
            )
            if user_food_response.food_record is not None:
                return user_food_response

            system_food_response = self.food_mapping_component(
                food_request, self.system_repository
            )
            if system_food_response.food_record is not None:
                return system_food_response

            # if both user and system db lookups fail, we can return
            # any of the two responses, it does not matter
            return system_food_response

        if lookup_preference == DBLookupPreference.system_db_user_db:
            system_food_response = self.food_mapping_component(
                food_request, self.system_repository
            )
            if system_food_response.food_record is not None:
                return system_food_response

            user_food_response = self.food_mapping_component(
                food_request, self.user_repository
            )
            if user_food_response.food_record is not None:
                return user_food_response

            return user_food_response

        if lookup_preference == DBLookupPreference.user_db:
            user_food_response = self.food_mapping_component(
                food_request, self.user_repository
            )
            if user_food_response.food_record is not None:
                return user_food_response

            return user_food_response

        if lookup_preference == DBLookupPreference.system_db:
            system_food_response = self.food_mapping_component(
                food_request, self.system_repository
            )
            if system_food_response.food_record is not None:
                return system_food_response

            return system_food_response

        raise ValueError(f"Invalid lookup preference: {lookup_preference}")

    def __call__(
        self, request: NutritionInformationRequest
    ) -> NutritionInformationResponse:
        audio_id = request.audio_id
        transcription = self.s2t_component(audio_id)
        food_requests = self.food_extraction_component(transcription)

        food_responses = []

        db_lookup_preference = request.db_lookup_preference

        for food_request in food_requests:
            food_response = self.map_food_in_repositories(
                food_request, db_lookup_preference
            )
            food_responses.append(food_response)

        nutrition_information_response = NutritionInformationResponse(
            raw_transcript=transcription,
            food_responses=food_responses,
            food_requests=food_requests,
            ni_request=request,
        )

        return nutrition_information_response
