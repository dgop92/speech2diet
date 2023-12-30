import logging

from config.settings import (
    AWS,
    DEEPGRAM_CONFIG,
    MOCK_AUDIO_STORAGE_FOLDER,
    MOCK_SERVICES,
)
from core.components.speech2text.application.s2t_service import Speech2TextService
from core.components.speech2text.definitions import Speech2TextComponent
from core.components.speech2text.infrastructure.mocks.mock_audio_storage import (
    MockAudioStorage,
)
from core.components.speech2text.infrastructure.mocks.mock_s2t_model import (
    MockSpeech2TextToModel,
)
from core.components.speech2text.infrastructure.real.deepgram import (
    DeepgramWhisperSpeech2TextModel,
)
from core.components.speech2text.infrastructure.real.s3_storage import S3AudioStorage

logger = logging.getLogger(__name__)


def speech2text_component_factory() -> Speech2TextComponent:
    if MOCK_SERVICES:
        logger.info("creating mock audio storage")
        audio_storage = MockAudioStorage(audio_folder_path=MOCK_AUDIO_STORAGE_FOLDER)
        logger.info("creating mock speech2text model")
        speech2text_model = MockSpeech2TextToModel()
    else:
        logger.info("creating s3 audio storage")
        audio_storage = S3AudioStorage(
            region_name=AWS["AWS_REGION"],
            bucket_name=AWS["AWS_S3_BUCKET"],
        )
        logger.info("creating deepgram whisper speech2text model")
        speech2text_model = DeepgramWhisperSpeech2TextModel(
            api_key=DEEPGRAM_CONFIG["KEY"]
        )
        logger.info("creating chatgpt food extraction service")

    logger.info("creating speech2text service")
    s2t = Speech2TextService(audio_storage, speech2text_model)
    return s2t
