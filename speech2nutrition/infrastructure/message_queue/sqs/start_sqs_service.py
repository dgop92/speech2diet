import logging

import boto3

from application.request_handler import handle_nutrition_information_request
from config.settings import AWS
from domain.entities.nutrition_information_request import NutritionInformationRequest
from infrastructure.factories.common import PipelineComponents
from infrastructure.message_queue.sqs.aws_sqs_consumer import SQSConsumer, SQSMessage

logger = logging.getLogger(__name__)


class SimpleConsumer(SQSConsumer):
    def set_pipeline_components(self, pipeline_components: PipelineComponents):
        self.pipeline_components = pipeline_components

    def handle_message(self, message: SQSMessage):
        body = message.Body
        logger.debug(f"received message: {body}")

        s2t_service = self.pipeline_components.s2t_service
        food_extraction_service = self.pipeline_components.food_extraction_service
        system_repository = self.pipeline_components.system_repository
        user_repository = self.pipeline_components.user_repository
        map_food_to_nutrition_db = self.pipeline_components.map_food_to_nutrition_db

        request = NutritionInformationRequest.parse_raw(body)
        logger.info(f"processing request: {request}")
        response = handle_nutrition_information_request(
            request,
            s2t_service,
            food_extraction_service,
            system_repository,
            user_repository,
            map_food_to_nutrition_db,
        )
        logger.info(f"successfully processed request: {request}")
        response_as_json = response.json()
        logger.info("sending response to nutrition response queue")
        self.sqs_client.send_message(
            QueueUrl=AWS["AWS_NUTRITION_RESPONSE_QUEUE_URL"],
            MessageBody=response_as_json,
        )
        logger.info("response sent to nutrition response queue")

    def handle_processing_exception(self, message: SQSMessage, exception: Exception):
        # delete message from queue even if processing fails
        # so far we don't have any dead letter queue, and we want to avoid infinite retries
        logger.exception(f"failed to process message {message.MessageId} from queue")
        try:
            self._delete_message(message)
        except Exception:
            logger.exception(f"failed to delete message {message.MessageId} from queue")


def start_sqs_app(pipeline_components: PipelineComponents):
    sqs_client = boto3.client(
        "sqs",
        region_name=AWS["AWS_REGION"],
        aws_access_key_id=AWS["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=AWS["AWS_SECRET_ACCESS_KEY"],
    )
    consumer = SimpleConsumer(
        sqs_client=sqs_client,
        queue_url=AWS["AWS_NUTRITION_REQUEST_QUEUE_URL"],
        polling_wait_time_ms=AWS["NUTRITION_REQUEST_QUEUE_POLLING_TIME"],
        batch_size=1,
    )
    consumer.set_pipeline_components(pipeline_components)
    logger.info("starting sqs consumer")
    consumer.start()
