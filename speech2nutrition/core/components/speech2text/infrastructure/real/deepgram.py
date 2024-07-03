import logging
from typing import Any, Dict

from deepgram import Deepgram

from core.domain.errors import ServiceException

logger = logging.getLogger(__name__)


class DeepgramWhisperSpeech2TextModel:
    def __init__(self, api_key: str):
        self.deepgram = Deepgram(api_key)
        self.options = {
            "language": "es-419",
            "model": "whisper-medium",
        }

    def transcribe(self, audio: bytes, metadata: Dict[str, Any]) -> str:
        """
        Transcribe audio using whisper medium model through deepgram

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
        mimetype: str = metadata["mime_type"]
        source = {"buffer": audio, "mimetype": mimetype}

        # timeout is set to 15 seconds because description of meals are short,
        # nevertheless in some cases the deepgram service is busy and
        # it takes more than 15 seconds to respond
        try:
            response = self.deepgram.transcription.sync_prerecorded(
                source,  # pyright: ignore [reportArgumentType]
                self.options,  # pyright: ignore [reportArgumentType]
                timeout=180,
            )
            return response["results"]["channels"][0]["alternatives"][0]["transcript"]  # pyright: ignore [reportTypedDictNotRequiredAccess]
        except Exception as e:
            raise ServiceException("could not transcribe audio", "deepgram") from e
