from typing import List, TypedDict


class ExpectedS2TFoodKeywordsCase(TypedDict):
    audio_id: str
    possible_transcription: str
    keywords: List[str]


class ExpectedS2TFoodUnitAmountCase(TypedDict):
    audio_id: str
    possible_transcription: str
    possible_units: List[str]
    possible_amounts: List[str]
