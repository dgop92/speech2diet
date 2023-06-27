from typing import List

from pydantic import BaseModel, validator


class FoodNutritionRequest(BaseModel):
    food_name: str
    description: List[str]
    amount: int
    unit: str

    @validator("food_name")
    def food_name_cannot_be_empty(cls, value):
        if value == "":
            raise ValueError("food_name cannot be empty")

        return value

    @validator("description", pre=True)
    def parse_description(cls, value):
        if isinstance(value, str):
            if value == "":
                return []

            keywords = value.split(",")
            sriped_keywords = [keyword.strip() for keyword in keywords]
            return sriped_keywords

        raise ValueError("description must be a string")

    @validator("amount")
    def amount_must_be_positive(cls, value):
        if value <= 0:
            raise ValueError("amount must be positive")

        return value
