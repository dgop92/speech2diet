from decouple import config

LOGGING_CONFIG_FILE = config("LOGGING_CONFIG_FILE")

DATABASE = {
    "mongo_url": config("MONGO_URL"),
    "db_name": config("DB_NAME"),
}
