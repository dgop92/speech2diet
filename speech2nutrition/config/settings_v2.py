import os

from decouple import config

from config.utils import Singleton


def config_as_str(key: str, **kwargs) -> str:
    return config(key, **kwargs)  # pyright: ignore [reportReturnType]


def config_as_bool(key: str, **kwargs) -> bool:
    return config(key, cast=bool, **kwargs)


def config_as_int(key: str, **kwargs) -> int:
    return config(key, cast=int, **kwargs)


# TODO: improve the conditional logic to avoid using default empty strings
# for some variables


class APPConfig(metaclass=Singleton):
    def __init__(self, load_secrets_from: str, env: str = "dev"):
        self.load_secrets_from = load_secrets_from
        self.env = env

        if self.env not in ["dev", "prod", "test"]:
            raise ValueError(
                f"Invalid environment: {self.env}, valid values: dev, prod and test"
            )

        self.logging_config_file = config_as_str(
            "LOGGING_CONFIG_FILE", default="logging-dev.conf"
        )
        self.mock_services = config_as_bool("MOCK_SERVICES", default=True)
        self.mock_audio_storage_folder = config_as_str(
            "MOCK_AUDIO_STORAGE_FOLDER", default="tests/data/audio"
        )
        self.message_queue_service = config_as_str("MESSAGE_QUEUE_SERVICE", default="")

        self.aws_region = config_as_str("AWS_REGION", default="us-east-1")
        self.aws_nutrition_response_queue = config_as_str(
            "AWS_NUTRITION_RESPONSE_QUEUE_URL", default=""
        )
        self.aws_s3_bucket = config_as_str("AWS_S3_BUCKET", default="")

        self.aws_nutrition_request_queue = config_as_str(
            "AWS_NUTRITION_REQUEST_QUEUE_URL", default=""
        )
        self.aws_nutrition_request_queue_polling_time = config_as_int(
            "NUTRITION_REQUEST_QUEUE_POLLING_TIME", default=60000
        )

        self._load_secrets()
        self._validate_settings()

    def _load_secrets(self):
        if self.load_secrets_from == "env":
            self._load_secrets_from_env()
        elif self.load_secrets_from == "ssm":
            self._load_secrets_from_ssm()
        else:
            raise ValueError(
                f"Invalid value for load_secrets_from: {self.load_secrets_from}, valid values: env and ssm"
            )

    def get_key_for_ssm(self, name: str):
        return f"/fitvoice-app/{self.env}/s2n/{name}"

    def _load_secrets_from_ssm(self):
        import boto3

        ssm = boto3.client("ssm", region_name=self.aws_region)

        self.nutrition_mongo_url = ssm.get_parameter(
            Name=self.get_key_for_ssm("nutrition_mongo_url"), WithDecryption=True
        )["Parameter"]["Value"]
        self.nutrition_db_name = ssm.get_parameter(
            Name=self.get_key_for_ssm("nutrition_db_name")
        )["Parameter"]["Value"]
        self.nutrition_system_db_collection_name = ssm.get_parameter(
            Name=self.get_key_for_ssm("nutrition_system_db_collection_name")
        )["Parameter"]["Value"]
        self.nutrition_system_db_collection_index = ssm.get_parameter(
            Name=self.get_key_for_ssm("nutrition_system_db_collection_index")
        )["Parameter"]["Value"]

        # Assumption: If we aren't using aws ssm, that means that we will not be using rabbitmq
        self.rabbitmq_url = ""

        self.open_ai_key = ssm.get_parameter(
            Name=self.get_key_for_ssm("open_ai_key"), WithDecryption=True
        )["Parameter"]["Value"]
        self.open_ai_engine = ssm.get_parameter(
            Name=self.get_key_for_ssm("open_ai_engine")
        )["Parameter"]["Value"]

        self.deepgram_key = ssm.get_parameter(
            Name=self.get_key_for_ssm("deepgram_key"), WithDecryption=True
        )["Parameter"]["Value"]

    def _load_secrets_from_env(self):
        self.nutrition_mongo_url = config_as_str("NUTRITION_MONGO_URL", default="")
        self.nutrition_db_name = config_as_str("NUTRITION_DB_NAME", default="")
        self.nutrition_system_db_collection_name = config_as_str(
            "NUTRITION_SYSTEM_DB_COLLECTION_NAME", default=""
        )
        self.nutrition_system_db_collection_index = config_as_str(
            "NUTRITION_SYSTEM_DB_COLLECTION_INDEX", default=""
        )

        if self.message_queue_service == "rabbitmq":
            self.rabbitmq_url = config_as_str("RABBITMQ_URL", default="")
        else:
            self.rabbitmq_url = ""

        self.open_ai_engine = config_as_str("OPENAI_ENGINE", default="gpt-3.5-turbo")
        self.open_ai_key = config_as_str("OPENAI_KEY", default="")

        self.deepgram_key = config_as_str("DEEPGRAM_KEY", default="")

        self._set_aws_credentials()

    def _validate_settings(self):
        if (
            self.message_queue_service == "sqs"
            and self.aws_nutrition_request_queue == ""
        ):
            raise ValueError(
                "AWS_NUTRITION_REQUEST_QUEUE_URL is required if using SQS Consumer aproach"
            )

    def _set_aws_credentials(self):
        aws_access_key_id = config_as_str("AWS_ACCESS_KEY_ID", default="")
        aws_secret_access_key = config_as_str("AWS_SECRET_ACCESS_KEY", default="")

        # decouple library does not set the env variables if available in a .env file
        # so we need to set them manually
        if aws_access_key_id != "":
            os.environ["AWS_ACCESS_KEY_ID"] = aws_access_key_id
        if aws_secret_access_key != "":
            os.environ["AWS_SECRET_ACCESS_KEY"] = aws_secret_access_key


SERVICE_ENVIRONMENT = config_as_str("SERVICE_ENVIRONMENT", default="dev")
SECRETS_FROM = config_as_str("SECRETS_FROM", default="env")
APP_CONFIG = APPConfig(load_secrets_from=SECRETS_FROM, env=SERVICE_ENVIRONMENT)
