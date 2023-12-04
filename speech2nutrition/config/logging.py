import logging
import logging.config

from config.settings import LOGGING_CONFIG_FILE


def config_logger():
    logging.getLogger("requests").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore.http11").setLevel(logging.WARNING)
    logging.getLogger("httpcore.connection").setLevel(logging.WARNING)
    logging.getLogger("openai._base_client").setLevel(logging.WARNING)
    logging.config.fileConfig(fname=LOGGING_CONFIG_FILE, disable_existing_loggers=False)
    logger = logging.getLogger(__name__)
    logger.info("logger configured")
