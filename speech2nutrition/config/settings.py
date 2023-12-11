from decouple import config

LOGGING_CONFIG_FILE = config("LOGGING_CONFIG_FILE")

DATABASE = {
    "mongo_url": config("MONGO_URL"),
    "db_name": config("DB_NAME"),
}

RABBITMQ_URL = config("RABBITMQ_URL", default="amqp://guest:guest@localhost:5672/")

MOCK_SERVICES = config("MOCK_SERVICES", cast=bool, default=True)

OPENAI_CONFIG = {
    "KEY": config("OPENAI_KEY", default=""),
    "ENGINE": config("OPENAI_ENGINE", default="gpt-3.5-turbo"),
}

DEEPGRAM_CONFIG = {
    "KEY": config("DEEPGRAM_KEY", default=""),
}
