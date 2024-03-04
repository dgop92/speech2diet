from typing import List

from core.data_exporters.definitions import CleanKeywordFoodRepository
from core.entities.clean_food import CleanKeywordFood
from core.tasks.generic_task import GenericTask


class SaveFoodsInDestTask(GenericTask):

    def save_foods(
        self, foods: List[CleanKeywordFood], repository: CleanKeywordFoodRepository
    ) -> None:
        self.logger.info("saving foods in destination database")
        data = repository.replace_with(foods)
        self.logger.info("foods saved in destination database")
        return data
