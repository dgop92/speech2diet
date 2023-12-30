import logging
import os
from typing import Any, Dict, Tuple

logger = logging.getLogger(__name__)


class MockAudioStorage:
    def __init__(self, audio_folder_path: str):
        self.audio_folder_path = audio_folder_path

    def read_file(self, audio_id: str) -> Tuple[bytes, Dict[str, Any]]:
        """
        Read audio from storage. As this is a mock it will be reading
        a text file from the audio folder

        Parameters
        ----------
        audio_id : str
            The file name from the audio folder
        Returns
        -------
        Tuple[bytes, Dict[str, Any]]
            The audio and metadata associated with the audio, such as mime type
        """
        audio_path = os.path.join(self.audio_folder_path, f"{audio_id}")
        logger.info(f"reading audio from {audio_path}")
        with open(audio_path, "rb") as audio_file:
            audio = audio_file.read()
        return audio, {}
