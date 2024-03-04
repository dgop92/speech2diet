from typing import List
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator, model_validator


def elements_must_be_non_empty(lst: List[str]) -> List[str]:
    for e in lst:
        assert len(e) > 0, "elements in the list must be non-empty"
    return lst


class CommonFood(BaseModel):
    """
    The CommonFood entity is a representation of food attributes that are common to all food sources, an standardization of different sources.
    """

    id: str = Field(default_factory=lambda: f"{uuid4()}")
    """ The id from the source database """
    # TODO: add validation for camel case
    db_source_name: str = Field(min_length=1)
    """ The name of the database source """
    food_name: str = Field(min_length=1)
    """ The main name of the food """
    other_names: List[str]
    """ Other possible names that the food is known as """
    description: List[str]
    """ attributes that describes the food, such cooked, raw, etc """
    serving_size: float = Field(gt=0)
    """ The recommended amount of food to be consumed """
    serving_size_unit: str = Field(min_length=1)
    """ The unit of the serving size """
    portion_size: float = Field(gt=0)
    """ The amount of food to compare the nutritional values"""
    portion_size_unit: str = Field(min_length=1)
    """ The unit of the portion size """
    calories: float = Field(ge=0)
    """ The amount of calories in cals given by the portion size """
    protein: float = Field(ge=0)
    """ The amount of protein in grams given by the portion size """
    fat: float = Field(ge=0)
    """ The amount of fat in grams given by the portion size """
    carbohydrates: float = Field(ge=0)
    """ The amount of carbohydrates in grams given by the portion size """

    def model_post_init(self, ctx):
        # Set id as the combination of db_source_name and uuid
        self.id = f"{self.db_source_name}/{uuid4()}"

    @field_validator("db_source_name")
    def db_source_name_must_not_contain_slash(cls, value):
        if "/" in value:
            raise ValueError("db_source_name must not contain a slash")
        return value

    @model_validator(mode="after")
    def portion_and_serving_unit_must_have_same_unit(self):
        if self.serving_size_unit != self.portion_size_unit:
            raise ValueError("serving size and portion size must have the same unit")
        return self

    _validate_description = field_validator("description")(elements_must_be_non_empty)
    _validate_other_names = field_validator("other_names")(elements_must_be_non_empty)
