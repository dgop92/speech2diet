import logging

logger = logging.getLogger(__name__)


def test_answer():
    assert 2 + 2 == 4


def test_logging():
    logger.debug("This is a test log, is 2 + 2 == 4?")
    assert 2 + 2 == 4
