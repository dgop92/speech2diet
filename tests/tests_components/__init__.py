from tests.tests_components.food_extraction import MockFoodExtractionService
from tests.tests_components.food_mapping import MockNutritionRepository
from tests.tests_components.speech_to_text import (
    MockAudioStorage,
    MockSpeech2TextToModel,
)

__all__ = [
    "MockAudioStorage",
    "MockFoodExtractionService",
    "MockNutritionRepository",
    "MockSpeech2TextToModel",
]
