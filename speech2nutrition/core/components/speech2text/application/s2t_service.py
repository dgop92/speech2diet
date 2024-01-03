import logging

from core.components.speech2text.definitions import AudioStorage, Speech2TextModel

logger = logging.getLogger(__name__)


class Speech2TextService:
    def __init__(
        self, audio_storage: AudioStorage, speech2text_model: Speech2TextModel
    ):
        self.audio_storage = audio_storage
        self.speech2text_model = speech2text_model

    def __call__(self, audio_id: str) -> str:
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
        logger.info(f"dowloading audio with id: {audio_id}")
        audio, audio_metadata = self.audio_storage.read_file(audio_id)
        logger.info(f"transcribing audio with id: {audio_id}")
        return self.speech2text_model.transcribe(audio, audio_metadata)
