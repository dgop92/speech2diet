import logging
import os
import sys

from config.logging import config_logger
from config.settings import MESSAGE_QUEUE_SERVICE
from infrastructure.factories.factory import pipeline_factory

if __name__ == "__main__":
    try:
        config_logger()
        logger = logging.getLogger(__name__)
        logger.info("initiating pipeline components")
        pipeline_components = pipeline_factory()
        if MESSAGE_QUEUE_SERVICE == "rabbitmq":
            from infrastructure.message_queue.rabbitmq.start_rabbit_service import (
                start_rabbit_app,
            )

            logger.info("starting rabbitmq app")
            start_rabbit_app(pipeline_components)
    except KeyboardInterrupt:
        logger.info("app stopped")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
