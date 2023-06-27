from typing import List

from pydantic import BaseModel, validator

VALID_SOURCES = ["user_db", "system_db"]


class Food(BaseModel):
    id: str
    """ The id format is <db-source>-<db-id> """
    food_name: str
    """ The main name of the food """
    other_names: List[str]
    """ Other possible names that the food is known as """
    description: List[str]
    """ attributes that describes the food, such cooked, raw, etc """
    portion_reference: int
    """ All the portion reference are in grams or milliliters """
    calories: int
    protein: int
    fat: int
    carbohydrates: int

    @validator("id")
    def id_must_contain_db_source(cls, value):
        db_source = value.split("-")[0]
        if db_source not in VALID_SOURCES:
            raise ValueError(
                f"invalid db source: {db_source}, must be one of {VALID_SOURCES}"
            )
        return value
