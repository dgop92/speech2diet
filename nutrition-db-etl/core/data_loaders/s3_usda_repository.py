import json
from typing import Any, Dict, List

import boto3


class USDAS3Repository:

    def __init__(self, bucket_name: str, access_key: str, secret_key: str) -> None:
        self.bucket_name = bucket_name
        self.s3 = boto3.client(
            "s3", aws_access_key_id=access_key, aws_secret_access_key=secret_key
        )

    def retrieve(self, key: str) -> List[Dict[str, Any]]:
        response = self.s3.get_object(Bucket=self.bucket_name, Key=key)
        return json.loads(response["Body"].read().decode("utf-8"))
