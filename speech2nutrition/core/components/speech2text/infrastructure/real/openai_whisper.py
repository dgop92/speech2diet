import logging
from io import BytesIO
from typing import Any, Dict

from openai import OpenAI

from core.domain.errors import ServiceException

logger = logging.getLogger(__name__)

SUPPORTED_EXTENSIONS = ["mp3", "mp4", "mpeg", "mpga", "m4a", "wav", "webm"]


class OpenAIWhisperSpeech2TextModel:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key, timeout=20)

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

        mime_type: str | None = metadata["mime_type"]

        if mime_type is None:
            raise ServiceException(
                "mime type is required to transcribe audio", "openai_whisper"
            )

        # if mime type is not supported, raise an error
        file_extension: str | None = None
        for supported_extensions in SUPPORTED_EXTENSIONS:
            if supported_extensions in mime_type:
                file_extension = supported_extensions
                break

        if file_extension is None:
            raise ServiceException(
                f"mime type {mime_type} is not supported", "openai_whisper"
            )

        logger.info(
            f"transcribing audio with openai whisper using extension {file_extension}"
        )
        print(file_extension)

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
