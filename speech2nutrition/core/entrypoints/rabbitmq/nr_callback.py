import logging
from typing import Any

from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties

from core.core_factory import RequestHandler
from core.domain.entities.nutrition_information_request import (
    NutritionInformationRequest,
)

logger = logging.getLogger(__name__)


class NutritionRequestCallback:
    def __init__(self, request_handler: RequestHandler):
        self.request_handler = request_handler

    def __call__(
        self,
        ch: BlockingChannel,
        method: Basic.Deliver,
        properties: BasicProperties,
        body: Any,
    ):
        logger.info("received message: %s", body)

        try:
            decoded_body = body.decode("utf-8")
            request = NutritionInformationRequest.parse_raw(decoded_body)
            response = self.request_handler(request)
            ch.queue_declare(queue="nutrition-replay-queue", durable=True)
            ch.basic_publish(
                exchange="",
                routing_key="nutrition-replay-queue",
                body=response.json(ensure_ascii=False),
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("error while processing message: %s", body)
            ch.basic_ack(delivery_tag=method.delivery_tag)
