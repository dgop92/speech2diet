import logging
import os
import sys

from config.logging import config_logger
from config.settings_v2 import APP_CONFIG
from core.core_factory import core_factory

if __name__ == "__main__":
    try:
        config_logger()
        logger = logging.getLogger(__name__)
        logger.info("initiating request handler")
        request_handler = core_factory()
        if APP_CONFIG.message_queue_service == "rabbitmq":
            from core.entrypoints.rabbitmq.start_rabbit_service import start_rabbit_app

            logger.info("starting rabbitmq app")
            start_rabbit_app(request_handler)
        elif APP_CONFIG.message_queue_service == "sqs":
            from core.entrypoints.sqs.start_sqs_service import start_sqs_app

            logger.info("starting sqs app")
            start_sqs_app(request_handler)
    except KeyboardInterrupt:
        logger.info("app stopped")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
