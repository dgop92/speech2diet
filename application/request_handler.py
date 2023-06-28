from application.s2t.services import Speech2TextService
from domain.definitions.food_extraction import FoodExtractionService
from domain.definitions.food_mapping import (
    MapFoodToNutritionDBRecord,
    NutritionRepository,
)
from domain.entities.food_nutrition_request import FoodNutritionRequest
from domain.entities.food_nutrition_response import FoodNutritionResponse
from domain.entities.nutrition_information_request import (
    DBLookupPreference,
    NutritionInformationRequest,
)
from domain.entities.nutrition_information_response import NutritionInformationResponse


def _map_food(
    request: FoodNutritionRequest,
    system_repository: NutritionRepository,
    user_repository: NutritionRepository,
    lookup_preference: DBLookupPreference,
    map_food_to_nutrition_db: MapFoodToNutritionDBRecord,
) -> FoodNutritionResponse:
    # TODO: collect suggestions from both user and system db if the food is not found

    if lookup_preference == DBLookupPreference.user_db_system_db:
        user_food_response = map_food_to_nutrition_db(request, user_repository)
        if user_food_response.food_record is not None:
            return user_food_response

        system_food_response = map_food_to_nutrition_db(request, system_repository)
        if system_food_response.food_record is not None:
            return system_food_response

        # if both user and system db lookups fail, we can return
        # any of the two responses, it does not matter
        return system_food_response

    if lookup_preference == DBLookupPreference.system_db_user_db:
        system_food_response = map_food_to_nutrition_db(request, system_repository)
        if system_food_response.food_record is not None:
            return system_food_response

        user_food_response = map_food_to_nutrition_db(request, user_repository)
        if user_food_response.food_record is not None:
            return user_food_response

        return user_food_response

    if lookup_preference == DBLookupPreference.user_db:
        user_food_response = map_food_to_nutrition_db(request, user_repository)
        if user_food_response.food_record is not None:
            return user_food_response

        return user_food_response

    if lookup_preference == DBLookupPreference.system_db:
        system_food_response = map_food_to_nutrition_db(request, system_repository)
        if system_food_response.food_record is not None:
            return system_food_response

        return system_food_response

    raise ValueError(f"Invalid lookup preference: {lookup_preference}")


def handle_nutrition_information_request(
    request: NutritionInformationRequest,
    s2t_service: Speech2TextService,
    food_extraction_service: FoodExtractionService,
    system_repository: NutritionRepository,
    user_repository: NutritionRepository,
    map_food_to_nutrition_db: MapFoodToNutritionDBRecord,
) -> NutritionInformationResponse:
    audio_id = request.audio_id
    transcription = s2t_service.transcribe_audio(audio_id)
    food_requests = food_extraction_service.extract_foods_from_text(transcription)
    food_responses = []

    db_lookup_preference = request.db_lookup_preference

    for food_request in food_requests:
        food_response = _map_food(
            food_request,
            system_repository,
            user_repository,
            db_lookup_preference,
            map_food_to_nutrition_db,
        )
        food_responses.append(food_response)

    nutrition_information_response = NutritionInformationResponse(
        raw_transcript=transcription,
        food_responses=food_responses,
        food_requests=food_requests,
        ni_request=request,
    )

    return nutrition_information_response
