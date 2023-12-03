import json
import logging
from typing import Any, Dict, List

from openai import OpenAI

from config.settings import OPENAI_CONFIG
from domain.entities.food_nutrition_request import FoodNutritionRequest
from infrastructure.pipeline_components.external.food_extraction.prompts import (
    EXTRACT_FOOD_INFO_PROMPT,
)

logger = logging.getLogger(__name__)


class ChatGPTFoodExtractionService:
    def __init__(self) -> None:
        logger.info("initializing ChatGPTFoodExtractionService")
        self.client = OpenAI(api_key=OPENAI_CONFIG["KEY"], timeout=10)

    def extract_foods_from_text(self, text: str) -> List[FoodNutritionRequest]:
        """
        Extract food names with its corresponding description, amount and unit from a
        text
        """
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": EXTRACT_FOOD_INFO_PROMPT.format(TEXT_FRAGMENT=text),
                    }
                ],
                model=OPENAI_CONFIG["ENGINE"],
                temperature=0,
                max_tokens=300,
            )
            content = chat_completion.choices[0].message["content"]
            raw_foods: List[Dict[str, Any]] = json.loads(content)
        except Exception as e:
            logger.warning(f"Error extracting food from text: {text} with error: {e}")
            return []

        food_nutrition_requests = []
        for food in raw_foods:
            try:
                food_nutrition_requests.append(FoodNutritionRequest(**food))
            except Exception as e:
                logger.warning(
                    f"Error parsing food: {food} with error: {e}", exc_info=True
                )

        return food_nutrition_requests
