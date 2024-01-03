from core.components.food_extraction.definitions import ExtractFoodComponent
from core.components.food_mapping.definitions.food_map_v2 import (
    MapFoodToNutritionDBComponentV2,
)
from core.components.speech2text.definitions import Speech2TextComponent
from core.domain.entities.nutrition_information_request import (
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
        food_mapping_component: MapFoodToNutritionDBComponentV2,
    ) -> None:
        self.s2t_component = s2t_component
        self.food_extraction_component = food_extraction_component
        self.food_mapping_component = food_mapping_component

    def __call__(
        self, request: NutritionInformationRequest
    ) -> NutritionInformationResponse:
        audio_id = request.audio_id
        transcription = self.s2t_component(audio_id)
        food_requests = self.food_extraction_component(transcription)

        food_responses = []

        db_lookup_preference = request.db_lookup_preference

        for food_request in food_requests:
            food_response = self.food_mapping_component(
                food_request, db_lookup_preference, request.user_id
            )
            food_responses.append(food_response)

        nutrition_information_response = NutritionInformationResponse(
            raw_transcript=transcription,
            food_responses=food_responses,
            food_requests=food_requests,
            ni_request=request,
        )

        return nutrition_information_response
