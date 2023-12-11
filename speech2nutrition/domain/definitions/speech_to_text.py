import logging
from typing import Any, Dict, Protocol, Tuple

logger = logging.getLogger(__name__)


class AudioStorage(Protocol):
    def read_file(self, audio_id: str) -> Tuple[bytes, Dict[str, Any]]:
        """
        Read audio from storage

        Parameters
        ----------
        audio_id : str
            Depending on the implementation this could be a file path or an id to download the audio from a storage service
        Returns
        -------
        Tuple[bytes, Dict[str, Any]]
            The audio and metadata associated with the audio, such as mime type
        """
        ...


class Speech2TextToModel(Protocol):
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
        ...
