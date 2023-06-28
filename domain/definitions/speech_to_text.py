import logging
from typing import Protocol

logger = logging.getLogger(__name__)


class AudioStorage(Protocol):
    def read_file(self, audio_id: str) -> bytes:
        """
        Read audio from storage

        Parameters
        ----------
        audio_id : str
            Depending on the implementation this could be a file path or an id to download the audio from a storage service
        """
        ...


class Speech2TextToModel(Protocol):
    def transcribe(self, audio: bytes) -> str:
        """
        Transcribe audio to text

        Parameters
        ----------
        audio : bytes
            The audio to transcribe

        Returns
        -------
        str
            The transcription of the audio
        """
        ...
