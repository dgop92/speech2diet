from datetime import datetime
from typing import Any, Dict

from core.components.food_extraction.definitions import ExtractFoodComponent
from core.components.food_mapping.definitions.food_map_v2 import (
    MapFoodToNutritionDBComponentV2,
)
from core.components.speech2text.definitions import Speech2TextModel
from core.domain.entities.nutrition_information_request import (
    DBLookupPreference,
    NutritionInformationRequest,
)
from core.domain.entities.nutrition_information_response import (
    NutritionInformationResponse,
)


class HTTPDemoRequestHandler:
    def __init__(
        self,
        speech2text_model: Speech2TextModel,
        food_extraction_component: ExtractFoodComponent,
        food_mapping_component: MapFoodToNutritionDBComponentV2,
    ) -> None:
        self.speech2text_model = speech2text_model
        self.food_extraction_component = food_extraction_component
        self.food_mapping_component = food_mapping_component

    def __call__(
        self, audio: bytes, metadata: Dict[str, Any]
    ) -> NutritionInformationResponse:
        transcription = self.speech2text_model.transcribe(audio, metadata)
        food_requests = self.food_extraction_component(transcription)

        food_responses = []

        db_lookup_preference = DBLookupPreference.system_db

        for food_request in food_requests:
            food_response = self.food_mapping_component(
                food_request, db_lookup_preference, "adskju123"
            )
            food_responses.append(food_response)

        nutrition_information_response = NutritionInformationResponse(
            raw_transcript=transcription,
            food_responses=food_responses,
            food_requests=food_requests,
            ni_request=NutritionInformationRequest(
                appUserId="adskju123",
                dbLookupPreference=db_lookup_preference,
                audioId="audio123",
                mealRecordedAt=datetime.now(),
            ),
        )

        return nutrition_information_response
