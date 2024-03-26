import json
from logging import Logger
from typing import Any, Dict, Optional

from openai import OpenAI

from core.entities.serving_size_response import ServingSizeResponseModel
from core.lib.llm.prompt import SERVING_SIZE_PROMPT


class ServingSizeExtractionService:
    def __init__(self, openai_key: str, engine: str, logger: Logger) -> None:
        self.client = OpenAI(api_key=openai_key, timeout=10)
        self.engine = engine
        self.logger = logger

    def __call__(self, food_name: str) -> Optional[ServingSizeResponseModel]:

        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": SERVING_SIZE_PROMPT.format(NAME=food_name),
                }
            ],
            model=self.engine,
            temperature=0,
            max_tokens=25,
        )
        content = chat_completion.choices[0].message.content
        if content:
            try:
                raw_response: Dict[str, Any] = json.loads(content)
                serving_size_response = ServingSizeResponseModel(**raw_response)
                return serving_size_response
            except Exception as e:
                self.logger.warning(
                    f"Couldn't find serving size for food item {food_name}", exc_info=e
                )

        return None
