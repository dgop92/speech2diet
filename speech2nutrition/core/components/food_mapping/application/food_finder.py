import logging

from core.components.food_mapping.definitions.food_map_v2 import RepoFoodsResponse
from core.components.food_mapping.definitions.repository import NutritionRepository
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.entities.nutrition_information_request import DBLookupPreference

logger = logging.getLogger(__name__)


def find_foods_by_preference(
    food_request: FoodNutritionRequest,
    lookup_preference: DBLookupPreference,
    system_repository: NutritionRepository,
    user_repository: NutritionRepository,
) -> RepoFoodsResponse:
    if lookup_preference == DBLookupPreference.user_db_system_db:
        logger.debug("looking up in user repository")
        user_foods = user_repository.get_foods_by_name(food_request.food_name)
        if len(user_foods) > 0:
            return RepoFoodsResponse(foods=user_foods)

        logger.debug("looking up in system repository")
        system_foods = system_repository.get_foods_by_name(food_request.food_name)
        return RepoFoodsResponse(foods=system_foods)

    if lookup_preference == DBLookupPreference.system_db_user_db:
        logger.debug("looking up in system repository")
        system_foods = system_repository.get_foods_by_name(food_request.food_name)
        if len(system_foods) > 0:
            return RepoFoodsResponse(foods=system_foods)

        logger.debug("looking up in user repository")
        user_foods = user_repository.get_foods_by_name(food_request.food_name)
        return RepoFoodsResponse(foods=user_foods)

    if lookup_preference == DBLookupPreference.user_db:
        logger.debug("looking up in user repository")
        user_foods = user_repository.get_foods_by_name(food_request.food_name)
        return RepoFoodsResponse(foods=user_foods)

    if lookup_preference == DBLookupPreference.system_db:
        logger.debug("looking up in system repository")
        system_foods = system_repository.get_foods_by_name(food_request.food_name)
        return RepoFoodsResponse(foods=system_foods)

    raise ValueError(f"Invalid lookup preference: {lookup_preference}")
