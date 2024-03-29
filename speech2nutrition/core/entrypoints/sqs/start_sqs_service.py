import logging

import boto3

from config.settings_v2 import APP_CONFIG
from core.core_factory import RequestHandler
from core.domain.entities.nutrition_information_request import (
    NutritionInformationRequest,
)
from core.entrypoints.sqs.aws_sqs_consumer import SQSConsumer, SQSMessage

logger = logging.getLogger(__name__)


class SimpleConsumer(SQSConsumer):
    def set_request_handler(self, request_handler: RequestHandler):
        self.request_handler = request_handler

    def handle_message(self, message: SQSMessage):
        body = message.Body
        logger.debug(f"received message: {body}")

        request = NutritionInformationRequest.parse_raw(body)
        logger.info(f"processing request: {request}")
        response = self.request_handler(request)
        logger.info(f"successfully processed request: {request}")
        response_as_json = response.json(ensure_ascii=False)
        logger.info("sending response to nutrition response queue")
        self.sqs_client.send_message(
            QueueUrl=APP_CONFIG.aws_nutrition_response_queue,
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


def start_sqs_app(request_handler: RequestHandler):
    sqs_client = boto3.client(
        "sqs",
        region_name=APP_CONFIG.aws_region,
    )
    consumer = SimpleConsumer(
        sqs_client=sqs_client,
        queue_url=APP_CONFIG.aws_nutrition_request_queue,
        polling_wait_time_ms=APP_CONFIG.aws_nutrition_request_queue_polling_time,
        batch_size=1,
    )
    consumer.set_request_handler(request_handler)
    logger.info("starting sqs consumer")
    consumer.start()
