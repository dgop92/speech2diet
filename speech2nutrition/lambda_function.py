import logging

import boto3

from application.request_handler import handle_nutrition_information_request
from config.logging import config_logger
from config.settings import AWS
from domain.entities.nutrition_information_request import NutritionInformationRequest
from infrastructure.factories.factory import pipeline_factory

sqs_client = boto3.client("sqs", region_name=AWS["AWS_REGION"])

config_logger()
logger = logging.getLogger(__name__)
logger.info("initiating pipeline components")
pipeline_components = pipeline_factory()


def handler(event, context):
    if "Records" in event:
        logger.info("processing AWS SQS Event")
        records = event["Records"]
        if len(records) == 0:
            logger.warning("no records in event, ignoring")
        elif len(records) > 1:
            logger.warning(
                "This lambda function only supports one record per event, ignoring"
            )
        else:
            # so far we don't have a dead letter queue, so we want to avoid infinite retries
            # TODO: add dead letter queue
            try:
                body = records[0]["body"]
                request = NutritionInformationRequest.parse_raw(body)
                logger.info(f"processing request: {request}")
                response = handle_nutrition_information_request(
                    request,
                    pipeline_components.s2t_service,
                    pipeline_components.food_extraction_service,
                    pipeline_components.system_repository,
                    pipeline_components.user_repository,
                    pipeline_components.map_food_to_nutrition_db,
                )
                logger.info(f"successfully processed request: {request}")
                response_as_json = response.json()
                logger.info("sending response to nutrition response queue")
                sqs_client.send_message(
                    QueueUrl=AWS["AWS_NUTRITION_RESPONSE_QUEUE_URL"],
                    MessageBody=response_as_json,
                )
                logger.info("response sent to nutrition response queue")
            except Exception:
                logger.exception("failed to process request")
    else:
        logger.warning("non AWS SQS Event, ignoring")
