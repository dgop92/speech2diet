import logging
from typing import Any, Dict, Tuple

import boto3

from core.domain.errors import ServiceException

logger = logging.getLogger(__name__)


class S3AudioStorage:
    def __init__(self, region_name: str, bucket_name: str) -> None:
        self.s3 = boto3.client(
            "s3",
            region_name=region_name,
        )
        self.bucket_name = bucket_name

    def read_file(self, audio_id: str) -> Tuple[bytes, Dict[str, Any]]:
        """
        Read audio from s3 storage

        Parameters
        ----------
        audio_id : str
            The object key of the audio in s3
        Returns
        -------
        Tuple[bytes, Dict[str, Any]]
            The audio and metadata associated with the audio, such as mime type
        """
        try:
            logger.info(f"reading audio from storage with id {audio_id}")
            response = self.s3.get_object(Bucket=self.bucket_name, Key=audio_id)
            content = response["Body"].read()
            metadata = {"mime_type": response["ContentType"]}
            logger.info(f"metadata for audio {audio_id} is {metadata}")
            return content, metadata
        except Exception as e:
            logger.exception(f"Failed to read audio from storage: {e}")
            raise ServiceException("Failed to read audio from storage", "S3")
