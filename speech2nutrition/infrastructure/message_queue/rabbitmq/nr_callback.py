import logging
from typing import Any

from pika.adapters.blocking_connection import BlockingChannel
from pika.spec import Basic, BasicProperties

from application.request_handler import handle_nutrition_information_request
from domain.entities.nutrition_information_request import \
    NutritionInformationRequest
from infrastructure.factories.common import PipelineComponents

logger = logging.getLogger(__name__)


class NutritionRequestCallback:
    def __init__(self, pipeline_components: PipelineComponents):
        self.pipeline_components = pipeline_components

    def __call__(
        self,
        ch: BlockingChannel,
        method: Basic.Deliver,
        properties: BasicProperties,
        body: Any,
    ):
        logger.info("received message: %s", body)

        s2t_service = self.pipeline_components.s2t_service
        food_extraction_service = self.pipeline_components.food_extraction_service
        system_repository = self.pipeline_components.system_repository
        user_repository = self.pipeline_components.user_repository
        map_food_to_nutrition_db = self.pipeline_components.map_food_to_nutrition_db

        try:
            decoded_body = body.decode("utf-8")
            request = NutritionInformationRequest.parse_raw(decoded_body)
            response = handle_nutrition_information_request(
                request,
                s2t_service,
                food_extraction_service,
                system_repository,
                user_repository,
                map_food_to_nutrition_db,
            )
            ch.queue_declare(queue="nutrition-replay-queue", durable=True)
            ch.basic_publish(
                exchange="",
                routing_key="nutrition-replay-queue",
                body=response.json(),
            )
            ch.basic_ack(delivery_tag=method.delivery_tag)
        except Exception:
            logger.exception("error while processing message: %s", body)
            ch.basic_ack(delivery_tag=method.delivery_tag)
