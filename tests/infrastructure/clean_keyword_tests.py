import logging

import pytest
import spacy
from spacy.language import Language

from infrastructure.food_mapping.clean_keyword import clean_description_keyword

logger = logging.getLogger(__name__)


@pytest.fixture(scope="module")
def nlp():
    logger.info("loading spacy model for spanish")
    return spacy.load("es_core_news_sm")


def test_clean_description_keyword_basic_input(nlp: Language):
    text = "Este es un ejemplo de descripción."
    expected_output = "ejemplo descripción"
    assert clean_description_keyword(nlp, text) == expected_output


def test_clean_description_keyword_with_punctuations(nlp: Language):
    text = "¡Carne cerdo!"
    expected_output = "carne cerdo"
    assert clean_description_keyword(nlp, text) == expected_output


def test_clean_description_keyword_with_stop_words(nlp: Language):
    text = "Carne de res"
    expected_output = "carne res"
    result = clean_description_keyword(nlp, text, disable_lemmatization=True)
    assert result == expected_output


def test_clean_description_keyword_with_lemmas(nlp: Language):
    text = "Carnes de vacuno"
    expected_output = "carne vacuno"
    assert clean_description_keyword(nlp, text) == expected_output


def test_clean_description_keyword_empty_input(nlp: Language):
    text = ""
    expected_output = ""
    assert clean_description_keyword(nlp, text) == expected_output


def test_clean_description_keyword_with_stop_words_and_punctuation(nlp: Language):
    text = "Arroz de leche."
    expected_output = "arroz leche"
    assert clean_description_keyword(nlp, text) == expected_output
