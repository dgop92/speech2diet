import logging
from typing import Any, Dict

from deepgram import Deepgram

from config.settings import DEEPGRAM_CONFIG
from domain.errors import ServiceException

logger = logging.getLogger(__name__)


class DeepgramWhisperSpeech2TextToModel:
    def __init__(self):
        self.deepgram = Deepgram(DEEPGRAM_CONFIG["KEY"])
        self.options = {
            "language": "es-419",
            "model": "whisper-medium",
        }

    def transcribe(self, audio: bytes, metadata: Dict[str, Any]) -> str:
        """
        Transcribe audio to text

        Parameters
        ----------
        audio : bytes
            The audio to transcribe
        metadata : Dict[str, Any]
            Metadata associated with the audio, such as mime type

        Returns
        -------
        str
            The transcription of the audio
        """
        if "mime_type" not in metadata:
            raise ServiceException("metadata must contain mime_type", "deepgram")

        logger.info(
            f"transcribing audio with deepgram using mime type {metadata['mime_type']}"
        )
        source = {"buffer": audio, "mimetype": metadata["mime_type"]}
        # timeout is set to 15 seconds because description of meals are short
        try:
            response = self.deepgram.transcription.sync_prerecorded(
                source, self.options, timeout=15
            )
            return response["results"]["channels"][0]["alternatives"][0]["transcript"]
        except Exception as e:
            raise ServiceException("could not transcribe audio", "deepgram") from e
