import logging

from config.settings_v2 import APP_CONFIG
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
    if APP_CONFIG.mock_services:
        logger.info("creating mock audio storage")
        audio_storage = MockAudioStorage(
            audio_folder_path=APP_CONFIG.mock_audio_storage_folder
        )
        logger.info("creating mock speech2text model")
        speech2text_model = MockSpeech2TextToModel()
    else:
        logger.info("creating s3 audio storage")
        audio_storage = S3AudioStorage(
            region_name=APP_CONFIG.aws_region, bucket_name=APP_CONFIG.aws_s3_bucket
        )
        logger.info("creating deepgram whisper speech2text model")
        speech2text_model = DeepgramWhisperSpeech2TextModel(
            api_key=APP_CONFIG.deepgram_key
        )

    logger.info("creating speech2text service")
    s2t = Speech2TextService(audio_storage, speech2text_model)
    return s2t
