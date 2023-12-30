import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


class MockSpeech2TextToModel:
    def transcribe(self, audio: bytes, metadata: Dict[str, Any]) -> str:
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
        logger.info("transcribing audio")
        return audio.decode("utf-8")
