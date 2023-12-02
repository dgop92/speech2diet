import logging

import pika

from config.settings import RABBITMQ_URL
from infrastructure.factories.factory import pipeline_factory
from infrastructure.message_queue import NutritionRequestCallback

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


def start_app():
    pipeline_components = pipeline_factory()
    callback = NutritionRequestCallback(pipeline_components)
    start_rabbitmq(callback)
