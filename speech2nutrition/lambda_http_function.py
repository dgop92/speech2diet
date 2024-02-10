import base64
import json
import logging
from typing import Any, Dict, Tuple

from requests_toolbelt.multipart import decoder

from config.logging import config_logger
from http_demo.core_factory import core_factory

config_logger()
logger = logging.getLogger(__name__)
logger.info("initiating request handler")
request_handler = core_factory()


def parse_base64_body(
    body: str,
    content_type: str,
) -> Tuple[bytes, Dict[str, Any]]:
    """
    Parse the base64 encoded body and return the audio content and its metadata.
    """
    parsed_body = base64.b64decode(body)
    multipart_data = decoder.MultipartDecoder(parsed_body, content_type)
    # The multipart content only contains one field, which is the audio file.
    for part in multipart_data.parts:
        audio_content = part.content
        headers = part.headers
        mime_type: str = headers[b"Content-Type"].decode("utf-8")  # type: ignore
        metadata = {"mime_type": mime_type}
        return audio_content, metadata

    raise ValueError("No audio content found in the request.")


def handler(event, context):
    if "body" in event:
        logger.info("processing HTTP Event")
        body = event["body"]
        content_type = event["headers"]["content-type"]
        logger.info(f"parsing body with content type: {content_type}")
        audio_content, metadata = parse_base64_body(body, content_type)
        logger.info(f"processing audio content with metadata: {metadata}")
        response = request_handler(audio_content, metadata)
        logger.info(f"successfully processed request")
        return {
            "statusCode": 200,
            "body": response.json(ensure_ascii=False),
        }
    else:
        logger.warning("non HTTP Event, ignoring")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid request"}, ensure_ascii=False),
        }
