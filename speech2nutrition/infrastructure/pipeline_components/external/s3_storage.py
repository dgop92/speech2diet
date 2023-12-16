import logging
from typing import Any, Dict, Tuple

import boto3

from config.settings import AWS
from domain.errors import ServiceException

logger = logging.getLogger(__name__)


class S3AudioStorage:
    def __init__(self) -> None:
        self.s3 = boto3.client(
            "s3",
            region_name=AWS["AWS_S3_REGION"],
            aws_access_key_id=AWS["AWS_ACCESS_KEY_ID"],
            aws_secret_access_key=AWS["AWS_SECRET_ACCESS_KEY"],
        )

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
        try:
            logger.info(f"reading audio from storage with id {audio_id}")
            response = self.s3.get_object(Bucket=AWS["AWS_S3_BUCKET"], Key=audio_id)
            content = response["Body"].read()
            metadata = {"mime_type": response["ContentType"]}
            logger.info(f"metadata for audio {audio_id} is {metadata}")
            return content, metadata
        except Exception as e:
            logger.exception(f"Failed to read audio from storage: {e}")
            raise ServiceException("Failed to read audio from storage", "S3")
