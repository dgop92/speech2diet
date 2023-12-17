"""
SQS consumer,

copy from https://github.com/HexmosTech/aws_sqs_consumer_python/tree/main/aws_sqs_consumer
"""

import logging
import time
import traceback
from typing import List

from infrastructure.message_queue.sqs.aws_sqs_consumer.error import SQSException
from infrastructure.message_queue.sqs.aws_sqs_consumer.message import SQSMessage

logger = logging.getLogger(__name__)


class SQSConsumer:
    """
    SQS consumer implementation.
    """

    def __init__(
        self,
        queue_url,
        sqs_client=None,
        attribute_names=[],
        message_attribute_names=[],
        batch_size=1,
        wait_time_seconds=1,
        visibility_timeout_seconds=None,
        polling_wait_time_ms=0,
    ):
        self.queue_url = queue_url
        self.attribute_names = attribute_names
        self.message_attribute_names = message_attribute_names

        if not 1 <= batch_size <= 10:
            raise ValueError("Batch size should be between 1 and 10, both inclusive")
        self.batch_size = batch_size

        self.wait_time_seconds = wait_time_seconds
        self.visibility_timeout_seconds = visibility_timeout_seconds
        self.polling_wait_time_ms = polling_wait_time_ms
        if sqs_client is None:
            raise ValueError("SQS client is required")
        self._sqs_client = sqs_client
        self._running = False

    def handle_message(self, message: SQSMessage):
        """
        Called when a single message is received.
        Write your own logic for handling the message
        by overriding this method.

        Note:
            * If `batch_size` is greater than 1,
              `handle_message_batch(message)` is called instead.
            * Any unhandled exception will be available in
              `handle_processing_exception(message, exception)` method.
        """
        ...

    def handle_message_batch(self, messages: List[SQSMessage]):
        """
        Called when a message batch is received.
        Write your own logic for handling the message batch
        by overriding thismethod.

        Note:
            * If `batch_size` equal to 1, `handle_message(message)`
              is called instead.
            * Any unhandled exception will be available in
              `handle_batch_processing_exception(message, exception)` method.
        """
        ...

    def handle_processing_exception(self, message: SQSMessage, exception: Exception):
        """
        Called when an exception is thrown while processing a message
        including messsage deletion from the queue.

        By default, this prints the exception traceback.
        Override this method to write any custom logic.
        """
        traceback.print_exc()

    def handle_batch_processing_exception(
        self, messages: List[SQSMessage], exception: Exception
    ):
        """
        Called when an exception is thrown while processing a message batch
        including messsage batch deletion from the queue.

        By default, this prints the exception traceback.
        Override this method to write any custom logic.
        """
        traceback.print_exc()

    def start(self):
        """
        Start the consumer.
        """
        # TODO: Figure out threading/daemon
        self._running = True
        while self._running:
            logger.debug("polling for messages")
            response = self._sqs_client.receive_message(**self._sqs_client_params)

            if not response.get("Messages", []):
                logger.debug("no messages received")
                self._polling_wait()
                continue

            messages = [
                SQSMessage.parse(message_dict) for message_dict in response["Messages"]
            ]

            if self.batch_size == 1:
                self._process_message(messages[0])
            else:
                self._process_message_batch(messages)

    def stop(self):
        """
        Stop the consumer.
        """
        # TODO: There's no way to invoke this other than a separate thread.
        self._running = False

    def _process_message(self, message: SQSMessage):
        try:
            self.handle_message(message)
            self._delete_message(message)
        except Exception as exception:
            self.handle_processing_exception(message, exception)
        finally:
            self._polling_wait()

    def _process_message_batch(self, messages: List[SQSMessage]):
        try:
            self.handle_message_batch(messages)
            self._delete_message_batch(messages)
        except Exception as exception:
            self.handle_batch_processing_exception(messages, exception)
        finally:
            self._polling_wait()

    def _delete_message(self, message: SQSMessage):
        try:
            self._sqs_client.delete_message(
                QueueUrl=self.queue_url, ReceiptHandle=message.ReceiptHandle
            )
        except Exception:
            raise SQSException("Failed to delete message")

    def _delete_message_batch(self, messages: List[SQSMessage]):
        try:
            self._sqs_client.delete_message_batch(
                QueueUrl=self.queue_url,
                Entries=[
                    {"Id": message.MessageId, "ReceiptHandle": message.ReceiptHandle}
                    for message in messages
                ],
            )
        except Exception:
            raise SQSException("Failed to delete message batch")

    @property
    def _sqs_client_params(self):
        params = {
            "QueueUrl": self.queue_url,
            "AttributeNames": self.attribute_names,
            "MessageAttributeNames": self.message_attribute_names,
            "MaxNumberOfMessages": self.batch_size,
            "WaitTimeSeconds": self.wait_time_seconds,
        }
        if self.visibility_timeout_seconds is not None:
            params["VisibilityTimeout"] = self.visibility_timeout_seconds

        return params

    def _polling_wait(self):
        time.sleep(self.polling_wait_time_ms / 1000)
