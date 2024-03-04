from spacy.language import Language


def remove_spanish_accents(text: str) -> str:
    """
    Remove spanish vowels accents from a text
    """
    text = text.replace("á", "a")
    text = text.replace("é", "e")
    text = text.replace("í", "i")
    text = text.replace("ó", "o")
    text = text.replace("ú", "u")
    return text


def clean_keyword(nlp: Language, text: str, disable_lemmatization: bool = True):
    """
    Clean the keyword by removing punctuations, symbols, stop words and
    finally apply lemmatization

    Lemmatization is disabled by default because depending on the model the accuracy of
    the lemmatization can contain errors such as 'carne de res' -> 'carne r' using
    the model es_core_news_sm.
    """

    text = text.lower()

    # Remove spanish accents
    text = remove_spanish_accents(text)

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

    return clean_text
