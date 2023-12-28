from decouple import config

LOGGING_CONFIG_FILE = config("LOGGING_CONFIG_FILE")

DATABASE = {
    "mongo_url": config("MONGO_URL"),
    "db_name": config("DB_NAME"),
}

RABBITMQ_URL = config("RABBITMQ_URL", default="")

MOCK_SERVICES = config("MOCK_SERVICES", cast=bool, default=True)

# available options: "sqs", "rabbitmq"
MESSAGE_QUEUE_SERVICE = config("MESSAGE_QUEUE_SERVICE", default="")

OPENAI_CONFIG = {
    "KEY": config("OPENAI_KEY", default=""),
    "ENGINE": config("OPENAI_ENGINE", default="gpt-3.5-turbo"),
}

DEEPGRAM_CONFIG = {
    "KEY": config("DEEPGRAM_KEY", default=""),
}

AWS = {
    "AWS_REGION": config("AWS_REGION", default="eu-east-1"),
    "AWS_NUTRITION_RESPONSE_QUEUE_URL": config("AWS_NUTRITION_RESPONSE_QUEUE_URL"),
    "AWS_NUTRITION_REQUEST_QUEUE_URL": config(
        "AWS_NUTRITION_REQUEST_QUEUE_URL", default=""
    ),
    # in milliseconds
    "NUTRITION_REQUEST_QUEUE_POLLING_TIME": config(
        "NUTRITION_REQUEST_QUEUE_POLLING_TIME", cast=int, default=60000
    ),
    "AWS_S3_BUCKET": config("AWS_S3_BUCKET"),
    "AWS_ACCESS_KEY_ID": config("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": config("AWS_SECRET_ACCESS_KEY"),
}

if MESSAGE_QUEUE_SERVICE == "sqs" and AWS["AWS_NUTRITION_REQUEST_QUEUE_URL"] == "":
    raise ValueError(
        "AWS_NUTRITION_REQUEST_QUEUE_URL is required if using SQS Consumer aproach"
    )

if MESSAGE_QUEUE_SERVICE == "rabbitmq" and RABBITMQ_URL == "":
    raise ValueError("RABBITMQ_URL is required if using RabbitMQ Consumer aproach")
