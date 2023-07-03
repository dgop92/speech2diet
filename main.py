import logging
import os
import sys

from config.logging import config_logger
from main.start_service import start_app

if __name__ == "__main__":
    try:
        config_logger()
        logger = logging.getLogger(__name__)
        logging.getLogger("pika").setLevel(logging.WARNING)
        logger.info("app started")
        start_app()
    except KeyboardInterrupt:
        logger.info("app stopped")
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)
