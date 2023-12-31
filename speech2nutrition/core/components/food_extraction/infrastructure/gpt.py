import json
import logging
from typing import Any, Dict, List

from openai import OpenAI

from core.components.food_extraction.infrastructure.build_prompt import (
    get_extraction_prompt,
)
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from core.domain.errors import ServiceException

logger = logging.getLogger(__name__)


class ChatGPTFoodExtractionService:
    def __init__(self, openai_key: str, engine: str) -> None:
        self.client = OpenAI(api_key=openai_key, timeout=10)
        self.engine = engine

    def __call__(self, text: str) -> List[FoodNutritionRequest]:
        """
        Extract food names with its corresponding description, amount and unit from a
        text
        """
        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": get_extraction_prompt(text),
                }
            ],
            model=self.engine,
            temperature=0,
            max_tokens=300,
        )
        content = chat_completion.choices[0].message.content
        if content:
            raw_foods: List[Dict[str, Any]] = json.loads(content)
        else:
            raise ServiceException(
                "content attribute is empty from chat completion",
                service_name="gpt-api",
            )

        food_nutrition_requests = []
        for food in raw_foods:
            try:
                food_nutrition_requests.append(FoodNutritionRequest(**food))
            except Exception as e:
                logger.warning(
                    f"Error parsing food: {food} with error: {e}", exc_info=True
                )

        return food_nutrition_requests
