import logging
from typing import Any


class GenericTask:

    def __init__(self, logger: logging.Logger, env_name: str) -> None:
        self.logger = logger
        self.env_name = env_name
