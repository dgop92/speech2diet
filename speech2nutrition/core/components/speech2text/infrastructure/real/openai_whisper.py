import logging
from io import BytesIO
from typing import Any, Dict

from openai import OpenAI

from core.domain.errors import ServiceException

logger = logging.getLogger(__name__)


class OpenAIWhisperSpeech2TextModel:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key, timeout=10)

    def transcribe(self, audio: bytes, metadata: Dict[str, Any]) -> str:
        """
        Transcribe audio using whisper large through openai

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

        logger.info(
            f"transcribing audio with openai whisper using mime type {metadata['mime_type']}"
        )

        file_extension = metadata["mime_type"].split("/")[1]

        # openai requires a BufferedReader object
        audio_bytes_io = BytesIO(audio)
        # this important for openai to recognize the file type, as it does not
        # scan the raw bytes, https://community.openai.com/t/openai-whisper-send-bytes-python-instead-of-filename/84786/4
        audio_bytes_io.name = f"file.{file_extension}"

        try:
            response = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_bytes_io,
                language="es",
            )
            return response.text
        except Exception as e:
            raise ServiceException(
                "could not transcribe audio", "openai_whisper"
            ) from e
