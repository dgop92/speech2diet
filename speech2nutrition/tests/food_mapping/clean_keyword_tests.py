import logging
import unittest

import pytest
import spacy
from spacy.language import Language

from core.components.food_mapping.infrastructure.nlp.clean_keyword import (
    clean_description_keyword,
)

logger = logging.getLogger(__name__)

assertions = unittest.TestCase()


@pytest.fixture(scope="module")
def nlp():
    logger.info("loading spacy model for spanish")
    return spacy.load("es_core_news_sm")


def test_clean_description_keyword_basic_input(nlp: Language):
    text = "Este es un ejemplo de descripcion."
    expected_output = "ejemplo descripcion"
    assertions.assertEqual(clean_description_keyword(nlp, text), expected_output)


def test_clean_description_keyword_with_punctuations(nlp: Language):
    text = "¡Carne cerdo!"
    expected_output = "carne cerdo"
    assertions.assertEqual(clean_description_keyword(nlp, text), expected_output)


def test_clean_description_keyword_with_accents(nlp: Language):
    text = "Una taza de café"
    expected_output = "taza cafe"
    assertions.assertEqual(clean_description_keyword(nlp, text), expected_output)


def test_clean_description_keyword_with_stop_words(nlp: Language):
    text = "Carne de res"
    expected_output = "carne res"
    result = clean_description_keyword(nlp, text, disable_lemmatization=True)
    assertions.assertEqual(result, expected_output)


def test_clean_description_keyword_with_lemmas(nlp: Language):
    text = "Carnes de vacuno"
    expected_output = "carne vacuno"
    result = clean_description_keyword(nlp, text, disable_lemmatization=False)
    assertions.assertEqual(result, expected_output)


def test_clean_description_keyword_empty_input(nlp: Language):
    text = ""
    expected_output = ""
    assertions.assertEqual(clean_description_keyword(nlp, text), expected_output)


def test_clean_description_keyword_with_stop_words_and_punctuation(nlp: Language):
    text = "Arroz de leche."
    expected_output = "arroz leche"
    assertions.assertEqual(clean_description_keyword(nlp, text), expected_output)
