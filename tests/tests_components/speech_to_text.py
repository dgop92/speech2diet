import logging
import os

logger = logging.getLogger(__name__)


class MockAudioStorage:
    def __init__(self, audio_folder_path: str):
        self.audio_folder_path = audio_folder_path

    def read_file(self, audio_id: str) -> bytes:
        """
        Read audio from storage. As this is a mock it will be reading
        a text file from the audio folder

        Parameters
        ----------
        audio_id : str
            The file name from the audio folder
        """
        audio_path = os.path.join(self.audio_folder_path, f"{audio_id}")
        logger.debug(f"reading audio from {audio_path}")
        with open(audio_path, "rb") as audio_file:
            audio = audio_file.read()
        return audio


class MockSpeech2TextToModel:
    def transcribe(self, audio: bytes) -> str:
        """
        Transcribe audio to text. As this is a mock it will be returning
        the audio as text. Use in conjuntion with MockAudioStorage

        Parameters
        ----------
        audio : bytes
            The audio to transcribe

        Returns
        -------
        str
            The transcription of the audio
        """
        logger.debug("transcribing audio")
        return audio.decode("utf-8")
