from typing import List

from tests.speech2text.test_sets.definitions import (
    ExpectedS2TFoodKeywordsCase,
    ExpectedS2TFoodUnitAmountCase,
)


def keyword_metric(real_keywords: List[str], expected_keywords: List[str]) -> float:
    """
    Given a list of real keywords and a list of expected keywords, check how many of the expected keywords are in the real keywords
    """
    total = len(expected_keywords)
    correct = len(set(real_keywords).intersection(set(expected_keywords)))

    return correct / total


def unit_amount_metric(
    posible_units_amounts: List[str], real_keywords: List[str]
) -> int:
    """
    Given the keywords in the transcription and the possible units/amounts, return 1 if at least one of the possible units/amounts is in the transcription, 0 otherwise
    """

    # if there are no possible units, that means we are not testing for units or amounts
    # return 1 to indicate that the test passed
    if len(posible_units_amounts) == 0:
        return 1

    results = []
    for posible_unit in posible_units_amounts:
        # a unit or amount may be composed of more than one word, ex 'un cuarto'
        words = posible_unit.split(" ")
        # all of those words must be in the transcription
        if all(word in real_keywords for word in words):
            results.append(True)

    return int(any(results))


def evaluate_test_case_keywords(
    test_case: ExpectedS2TFoodKeywordsCase,
    raw_transcription: str,
):
    """
    Evaluate a keywords test case, keyword_metric is between 0 and 1
    """
    raw_transcription = raw_transcription.lower()

    real_keywords = raw_transcription.split(" ")
    expected_keywords = test_case["keywords"]

    return {
        "keyword_metric": keyword_metric(real_keywords, expected_keywords),
    }


def evaluate_test_case_amount_unit(
    test_case: ExpectedS2TFoodUnitAmountCase,
    raw_transcription: str,
):
    """
    Evaluate a unit and amount test case, unit_metric and amount_metric are 0 or 1
    """
    raw_transcription = raw_transcription.lower()

    real_keywords = raw_transcription.split(" ")
    expected_units = test_case["possible_units"]
    expected_amounts = test_case["possible_amounts"]

    return {
        "unit_metric": unit_amount_metric(expected_units, real_keywords),
        "amount_metric": unit_amount_metric(expected_amounts, real_keywords),
    }
