from typing import List

from pymongo import MongoClient

from core.entities.clean_food import CleanKeywordFood


class NutritionMongoRepository:
    def __init__(self, mongo_uri: str, db_name: str, collection_name: str):
        self.client = MongoClient(mongo_uri)
        self.db = self.client[db_name]
        self.collection = self.db[collection_name]

    def save_one(self, food: CleanKeywordFood) -> None:
        self.collection.insert_one(food.model_dump())

    def replace_with(self, foods: List[CleanKeywordFood]) -> None:
        example_food = foods[0]
        # Delete all foods with the same db_source_name
        self.collection.delete_many({"db_source_name": example_food.db_source_name})
        self.collection.insert_many([food.model_dump() for food in foods])
