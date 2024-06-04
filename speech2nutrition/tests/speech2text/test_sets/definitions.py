from typing import List, TypedDict


class ExpectedS2TFood(TypedDict):
    audio_id: str
    possible_transcription: str
    keywords: List[str]
    possible_units: List[str]
    possible_amounts: List[str]
