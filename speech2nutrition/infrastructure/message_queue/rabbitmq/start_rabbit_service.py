import logging

import pika

from config.settings import RABBITMQ_URL
from infrastructure.factories.common import PipelineComponents
from infrastructure.message_queue.rabbitmq.nr_callback import NutritionRequestCallback

logger = logging.getLogger(__name__)


def start_rabbitmq(callback: NutritionRequestCallback):
    logger.info("connecting to rabbitmq")
    connection = pika.BlockingConnection(pika.URLParameters(RABBITMQ_URL))
    channel = connection.channel()
    logger.info("connected to rabbitmq")

    channel.queue_declare(queue="nutrition-request-queue", durable=True)
    channel.basic_consume(
        queue="nutrition-request-queue", on_message_callback=callback, auto_ack=False
    )

    logger.info("waiting for messages, press CTRL+C to exit")
    channel.start_consuming()


def start_rabbit_app(pipeline_components: PipelineComponents):
    callback = NutritionRequestCallback(pipeline_components)
    start_rabbitmq(callback)
