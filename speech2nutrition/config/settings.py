import os

from decouple import config


def config_as_str(key: str, **kwargs) -> str:
    return config(key, **kwargs)  # type: ignore


def config_as_bool(key: str, **kwargs) -> bool:
    return config(key, cast=bool, **kwargs)


def config_as_int(key: str, **kwargs) -> int:
    return config(key, cast=int, **kwargs)


LOGGING_CONFIG_FILE = config_as_str("LOGGING_CONFIG_FILE")

DATABASE = {
    "mongo_url": config_as_str("MONGO_URL"),
    "db_name": config_as_str("DB_NAME"),
}

RABBITMQ_URL = config_as_str("RABBITMQ_URL", default="")

MOCK_SERVICES = config_as_bool("MOCK_SERVICES", default=True)
MOCK_AUDIO_STORAGE_FOLDER = config_as_str(
    "MOCK_AUDIO_STORAGE_FOLDER", default="tests/data/audio"
)

# available options: "sqs", "rabbitmq"
MESSAGE_QUEUE_SERVICE = config_as_str("MESSAGE_QUEUE_SERVICE", default="")

OPENAI_CONFIG = {
    "KEY": config_as_str("OPENAI_KEY", default=""),
    "ENGINE": config_as_str("OPENAI_ENGINE", default="gpt-3.5-turbo"),
}

DEEPGRAM_CONFIG = {
    "KEY": config_as_str("DEEPGRAM_KEY", default=""),
}

AWS = {
    "AWS_REGION": config_as_str("AWS_REGION", default="eu-east-1"),
    "AWS_NUTRITION_RESPONSE_QUEUE_URL": config_as_str(
        "AWS_NUTRITION_RESPONSE_QUEUE_URL"
    ),
    "AWS_NUTRITION_REQUEST_QUEUE_URL": config_as_str(
        "AWS_NUTRITION_REQUEST_QUEUE_URL", default=""
    ),
    # in milliseconds
    "NUTRITION_REQUEST_QUEUE_POLLING_TIME": config_as_int(
        "NUTRITION_REQUEST_QUEUE_POLLING_TIME", default=60000
    ),
    "AWS_S3_BUCKET": config_as_str("AWS_S3_BUCKET"),
    # if we run the service in AWS, we can use the IAM role for credentials
    "AWS_ACCESS_KEY_ID": config_as_str("AWS_ACCESS_KEY_ID", default=""),
    "AWS_SECRET_ACCESS_KEY": config_as_str("AWS_SECRET_ACCESS_KEY", default=""),
}

# for aws credentials,
if AWS["AWS_ACCESS_KEY_ID"] != "":
    os.environ["AWS_ACCESS_KEY_ID"] = AWS["AWS_ACCESS_KEY_ID"]
if AWS["AWS_SECRET_ACCESS_KEY"] != "":
    os.environ["AWS_SECRET_ACCESS_KEY"] = AWS["AWS_SECRET_ACCESS_KEY"]

if MESSAGE_QUEUE_SERVICE == "sqs" and AWS["AWS_NUTRITION_REQUEST_QUEUE_URL"] == "":
    raise ValueError(
        "AWS_NUTRITION_REQUEST_QUEUE_URL is required if using SQS Consumer aproach"
    )

if MESSAGE_QUEUE_SERVICE == "rabbitmq" and RABBITMQ_URL == "":
    raise ValueError("RABBITMQ_URL is required if using RabbitMQ Consumer aproach")
