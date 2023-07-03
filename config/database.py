from pymongo import MongoClient

from config.settings import DATABASE
from config.utils import Singleton


class MongoDatabase(metaclass=Singleton):
    def __init__(self):
        self.client = MongoClient(DATABASE["mongo_url"])
        self.db = self.client[DATABASE["db_name"]]

    def get_database(self):
        return self.db

    def get_collection(self, collection_name):
        return self.db[collection_name]

    def close(self):
        self.client.close()
