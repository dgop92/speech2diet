import logging

from spacy.language import Language

logger = logging.getLogger(__name__)


def clean_description_keyword(
    nlp: Language, text: str, disable_lemmatization: bool = True
):
    """
    Clean the description's keyword by removing punctuations, symbols, stop words and
    finally apply lemmatization

    Lemmatization is disabled by default because depending on the model the accuracy of
    the lemmatization can contain errors such as 'carne de res' -> 'carne r' using
    the model es_core_news_sm.
    """
    logger.debug(f"cleaning description keyword '{text}'")

    text = text.lower()

    doc = nlp(text)

    # Remove punctuations and symbols
    tokens = [token.text for token in doc if not token.is_punct]
    clean_text = " ".join(tokens)

    # Remove stop words
    tokens = [token.text for token in nlp(clean_text) if not token.is_stop]
    clean_text = " ".join(tokens)

    # Apply lemmatization
    if not disable_lemmatization:
        tokens = [token.lemma_ for token in nlp(clean_text)]
        clean_text = " ".join(tokens)

    logger.debug(f"cleaned description keyword '{clean_text}'")

    return clean_text
