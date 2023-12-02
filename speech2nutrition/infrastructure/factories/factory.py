from factories.common import PipelineComponents
from factories.fake_factory import fake_factory

from config.settings import MOCK_SERVICES


def pipeline_factory() -> PipelineComponents:
    """
    Return the pipeline components to be used in the application

    If MOCK_SERVICES is True, then a fake factory is returned
    otherwise a real factory is returned
    """
    if MOCK_SERVICES:
        return fake_factory()
    else:
        raise NotImplementedError("Not implemented yet")
