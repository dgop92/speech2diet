import logging
import logging.config

from config.settings_v2 import APP_CONFIG


def config_logger():
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore.http11").setLevel(logging.WARNING)
    logging.getLogger("httpcore.connection").setLevel(logging.WARNING)
    logging.getLogger("openai._base_client").setLevel(logging.WARNING)
    logging.getLogger("botocore").setLevel(logging.WARNING)
    logging.getLogger("pika").setLevel(logging.WARNING)
    logging.config.fileConfig(
        fname=APP_CONFIG.logging_config_file, disable_existing_loggers=False
    )
    logger = logging.getLogger(__name__)
    logger.info("logger configured")
