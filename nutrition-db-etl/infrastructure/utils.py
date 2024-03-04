from typing import Callable

import spacy

from core.lib.nlp.clean_keyword import clean_keyword


def build_clean_function() -> Callable[[str], str]:
    nlp = spacy.load("es_core_news_sm")

    def clean_func(text: str) -> str:
        return clean_keyword(nlp, text)

    return clean_func
