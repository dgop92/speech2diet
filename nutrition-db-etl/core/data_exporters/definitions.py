from typing import List, Protocol

from core.entities.clean_food import CleanKeywordFood


class CleanKeywordFoodRepository(Protocol):

    def save_one(self, food: CleanKeywordFood) -> None: ...

    def replace_with(self, foods: List[CleanKeywordFood]) -> None: ...
