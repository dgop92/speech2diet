import logging

import boto3

from config.logging import config_logger
from config.settings_v2 import APP_CONFIG
from core.core_factory import core_factory
from core.domain.entities.nutrition_information_request import (
    NutritionInformationRequest,
)

sqs_client = boto3.client("sqs", region_name=APP_CONFIG.aws_region)

config_logger()
logger = logging.getLogger(__name__)
logger.info("initiating request handler")
request_handler = core_factory()


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
                response = request_handler(request)
                logger.info(f"successfully processed request: {request}")
                response_as_json = response.json()
                logger.info("sending response to nutrition response queue")
                sqs_client.send_message(
                    QueueUrl=APP_CONFIG.aws_nutrition_response_queue,
                    MessageBody=response_as_json,
                )
                logger.info("response sent to nutrition response queue")
            except Exception:
                logger.exception("failed to process request")
    else:
        logger.warning("non AWS SQS Event, ignoring")
