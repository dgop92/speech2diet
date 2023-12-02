from infrastructure.pipeline_components.fake.food_extraction import (
    MockFoodExtractionService,
)
from infrastructure.pipeline_components.fake.food_mapping import MockNutritionRepository
from infrastructure.pipeline_components.fake.speech_to_text import (
    MockAudioStorage,
    MockSpeech2TextToModel,
)

__all__ = [
    "MockAudioStorage",
    "MockFoodExtractionService",
    "MockNutritionRepository",
    "MockSpeech2TextToModel",
]
