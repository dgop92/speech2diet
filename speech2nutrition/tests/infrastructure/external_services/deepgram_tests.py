import logging

import pytest

from infrastructure.pipeline_components.external.deepgram import (
    DeepgramWhisperSpeech2TextToModel,
)

logger = logging.getLogger(__name__)


@pytest.fixture(scope="module")
def s2t():
    logger.info("loading spacy model for spanish")
    return DeepgramWhisperSpeech2TextToModel()


def test_food_with_units(s2t: DeepgramWhisperSpeech2TextToModel):
    _ = "hoy almorcé 100 gramos de arroz con 80 gramos de carne"
    expected_words = set(
        [
            "100",
            "gramos",
            "arroz",
            "80",
            "carne",
        ]
    )
    with open("tests/audio-tests/audio-test-2.mp3", "rb") as audio_file:
        audio = audio_file.read()
        metadata = {"mime_type": "audio/mp3"}
        hypothesis_text = s2t.transcribe(audio, metadata)
        hypothesis_words = set(hypothesis_text.split())
        # we just want to check that the expected words are in the hypothesis
        diff_words = expected_words.difference(hypothesis_words)
        assert len(diff_words) == 0, f"expected words not in hypothesis: {diff_words}"


def test_just_food(s2t: DeepgramWhisperSpeech2TextToModel):
    _ = "hoy hice una merienda con dos arepas de maíz y un vaso de jugo de guayaba"
    expected_words = set(
        [
            "dos",
            "arepas",
            "maíz",
            "vaso",
            "jugo",
            "guayaba",
        ]
    )
    with open("tests/audio-tests/audio-test-1.mp3", "rb") as audio_file:
        audio = audio_file.read()
        metadata = {"mime_type": "audio/mp3"}
        hypothesis_text = s2t.transcribe(audio, metadata)
        hypothesis_words = set(hypothesis_text.split())
        # we just want to check that the expected words are in the hypothesis
        diff_words = expected_words.difference(hypothesis_words)
        assert len(diff_words) == 0, f"expected words not in hypothesis: {diff_words}"
