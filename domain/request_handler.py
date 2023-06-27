from domain.definitions.food_extraction import FoodExtractionService
from domain.definitions.food_mapping import FoodMappingService
from domain.definitions.speech_to_text import Speech2TextService
from domain.entities.nutrition_information_request import NutritionInformationRequest
from domain.entities.nutrition_information_response import NutritionInformationResponse


def handle_nutrition_information_request(
    request: NutritionInformationRequest,
    s2t_service: Speech2TextService,
    food_extraction_service: FoodExtractionService,
    food_mapping_service: FoodMappingService,
):
    audio_id = request.audio_id
    transcription = s2t_service.transcribe_audio(audio_id)
    food_requests = food_extraction_service.extract_foods_from_text(transcription)
    food_responses = []
    for food_request in food_requests:
        food_response = food_mapping_service.map_food_to_nutrition_db_record(
            food_request, request.user_id, request.db_lookup_preference
        )
        food_responses.append(food_response)

    nutrition_information_response = NutritionInformationResponse(
        raw_transcript=transcription,
        food_responses=food_responses,
        food_requests=food_requests,
        ni_request=request,
    )

    return nutrition_information_response
