from logging import Logger
from typing import Callable, List

from core.entities.clean_food import CleanKeywordFood
from core.entities.common_food import CommonFood
from core.tasks.generic_task import GenericTask

CleanKeywordFunc = Callable[[str], str]


class CreateCleanFoodTask(GenericTask):

    def __init__(
        self, logger: Logger, env_name: str, clean_keyword_func: CleanKeywordFunc
    ):
        super().__init__(logger, env_name)
        self.clean_keyword_func = clean_keyword_func

    def create_clean_food(
        self, common_foods: List[CommonFood]
    ) -> List[CleanKeywordFood]:
        clean_foods = []
        for food in common_foods:
            keywords = [food.food_name, *food.other_names, *food.description]
            cleaned_keywords = [
                self.clean_keyword_func(keyword) for keyword in keywords
            ]
            clean_keyword_food = CleanKeywordFood(
                **food.model_dump(), search_keywords=cleaned_keywords
            )
            clean_foods.append(clean_keyword_food)

        return clean_foods
