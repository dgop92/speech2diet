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


class Speech2TextService:
    def __init__(
        self, audio_storage: AudioStorage, speech2text_model: Speech2TextToModel
    ):
        self.audio_storage = audio_storage
        self.speech2text_model = speech2text_model

    def transcribe_audio(self, audio_id: str) -> str:
        """
        Transcribe audio given an audio id

        Parameters
        ----------
        audio_id : str
            Depending on the implementation this could be a file path or an id to download the audio from a storage service

        Returns
        -------
        str
            The transcription of the audio
        """
        logger.debug(f"dowloading audio with id: {audio_id}")
        audio = self.audio_storage.read_file(audio_id)
        logger.debug(f"transcribing audio with id: {audio_id}")
        return self.speech2text_model.transcribe(audio)
