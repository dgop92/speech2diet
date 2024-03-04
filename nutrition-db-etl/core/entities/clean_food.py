from typing import List

from pydantic import Field

from core.entities.common_food import CommonFood


class CleanKeywordFood(CommonFood):
    """
    The CleanKeywordFood entity inherits from CommonFood and adds a list of search keywords to be used by a search engine.

    The search keywords are the nlp cleaned food name, other names and descriptions.
    """

    search_keywords: List[str] = Field(min_length=1)
