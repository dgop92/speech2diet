from decouple import config

LOGGING_CONFIG_FILE = config("LOGGING_CONFIG_FILE")

DATABASE = {
    "mongo_url": config("MONGO_URL"),
    "db_name": config("DB_NAME"),
}

RABBITMQ_URL = config("RABBITMQ_URL", default="amqp://guest:guest@localhost:5672/")

MOCK_SERVICES = config("MOCK_SERVICES", cast=bool, default=True)

# available options: "sqs", "rabbitmq"
MESSAGE_QUEUE_SERVICE = config("MESSAGE_QUEUE_SERVICE", default="sqs")

OPENAI_CONFIG = {
    "KEY": config("OPENAI_KEY", default=""),
    "ENGINE": config("OPENAI_ENGINE", default="gpt-3.5-turbo"),
}

DEEPGRAM_CONFIG = {
    "KEY": config("DEEPGRAM_KEY", default=""),
}

AWS = {
    "AWS_REGION": config("AWS_REGION", default="eu-east-1"),
    "AWS_NUTRITION_REQUEST_QUEUE_URL": config("AWS_NUTRITION_REQUEST_QUEUE_URL"),
    "AWS_NUTRITION_RESPONSE_QUEUE_URL": config("AWS_NUTRITION_RESPONSE_QUEUE_URL"),
    # in milliseconds
    "NUTRITION_REQUEST_QUEUE_POLLING_TIME": config(
        "NUTRITION_REQUEST_QUEUE_POLLING_TIME", cast=int, default=60000
    ),
    "AWS_S3_BUCKET": config("AWS_S3_BUCKET"),
    "AWS_ACCESS_KEY_ID": config("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": config("AWS_SECRET_ACCESS_KEY"),
}
