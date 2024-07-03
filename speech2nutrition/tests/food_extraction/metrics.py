from itertools import product
from typing import Dict, List, Set, Tuple

from spacy.language import Language

from core.components.food_mapping.infrastructure.nlp.clean_keyword import (
    clean_description_keyword,
)
from core.domain.entities.food_nutrition_request import FoodNutritionRequest
from tests.food_extraction.test_sets.definitions import (
    ExpectedFoodItem,
    FoodExtractionTestCase,
)


def avg(lst: List[float]) -> float:
    if len(lst) == 0:
        return 0
    return sum(lst) / len(lst)


def merge_food_name_description(
    nlp: Language, name: str, description: List[str]
) -> Set[str]:
    """
    Merge the food name and description into a single string and clean it
    """
    final_food_description = f"{name} {' '.join(description)}"
    clean_text = clean_description_keyword(nlp, final_food_description)
    return set(clean_text.split(" "))


def name_metric(nlp: Language, name: str, expected_name: str) -> int:
    """
    Given a food name and an expected food name, compute a metric that is 1 if the names are the same and 0 otherwise. An exact match strategy is used after cleaning the names
    """

    cleaned_name = clean_description_keyword(nlp, name)
    cleaned_expected_name = clean_description_keyword(nlp, expected_name)

    return 1 if cleaned_name == cleaned_expected_name else 0


def description_metric(
    nlp: Language, description: List[str], expected_description: List[str]
) -> float:
    """
    Given a food description and an expected food description, compute a metric based on the intersection of the words in the descriptions
    """
    final_food_description = clean_description_keyword(nlp, " ".join(description))
    expected_final_food_description = clean_description_keyword(
        nlp, " ".join(expected_description)
    )

    ffd_set = set(final_food_description.split(" "))
    effd_set = set(expected_final_food_description.split(" "))

    # simple accuracy
    total = len(ffd_set)
    correct = len(ffd_set.intersection(effd_set))

    return correct / total


def name_description_metric(
    nlp: Language,
    name: str,
    description: List[str],
    expected_name: str,
    expected_description: List[str],
) -> float:
    """
    Merge food names and descriptions and compute a metric based on the intersection of the words in the merged representations
    """
    final_food_description = merge_food_name_description(nlp, name, description)
    expected_final_food_description = merge_food_name_description(
        nlp, expected_name, expected_description
    )
    # simple accuracy
    total = len(expected_final_food_description)
    correct = len(final_food_description.intersection(expected_final_food_description))

    return correct / total


def unit_metric(unit: str, valid_units: List[str]) -> int:
    """
    Given a food unit and a list of valid units, compute a metric that is 1 if at least one of the units is the same and 0 otherwise. Valid units is required to overcome the issue of same units, different ways of writing them (e.g. g, gr, grams)
    """
    return 1 if unit.lower() in valid_units else 0


def amount_metric(amount: float, expected_amount: float) -> int:
    """
    Given a food amount and an expected food amount, compute a metric that is 1 if the amounts are the same and 0 otherwise
    """
    return 1 if amount == expected_amount else 0


def individual_performance_metric(
    nlp: Language,
    food: FoodNutritionRequest,
    expected_item: ExpectedFoodItem,
) -> Dict[str, float]:
    """
    Performance metric based on five components:
    - name metric
    - description metric
    - name + description metric
    - unit metric
    - amount metric

    All metrics are in the range [0, 1] where 1 is the best possible score and 0 is the worst possible score.

    The final metric is the sum of the five components
    """
    name_score = name_metric(nlp, food.food_name, expected_item["food"].food_name)
    description_score = description_metric(
        nlp, food.description, expected_item["food"].description
    )
    name_description_score = name_description_metric(
        nlp,
        food.food_name,
        food.description,
        expected_item["food"].food_name,
        expected_item["food"].description,
    )
    unit_score = unit_metric(
        food.unit, [expected_item["food"].unit] + expected_item["unit_variants"]
    )
    amount_score = amount_metric(food.amount, expected_item["food"].amount)

    return {
        "name": name_score,
        "description": description_score,
        "name_description": name_description_score,
        "unit": unit_score,
        "amount": amount_score,
        "total": (
            name_score
            + description_score
            + name_description_score
            + unit_score
            + amount_score
        )
        / 5,
    }


def pick_the_best_from_combinations(
    nlp: Language, combs: List[Tuple[FoodNutritionRequest, ExpectedFoodItem]], topk: int
) -> List[Dict[str, float]]:
    individual_metrics = []
    for comb in combs:
        ind_metric = individual_performance_metric(nlp, comb[0], comb[1])
        individual_metrics.append(ind_metric)

    sorted_individual_metrics = sorted(
        individual_metrics, key=lambda x: x["total"], reverse=True
    )
    return sorted_individual_metrics[:topk]


def evaluate_test_case(
    nlp: Language,
    test_case: FoodExtractionTestCase,
    real_foods: List[FoodNutritionRequest],
):
    expected_food_items = test_case["expected_foods_items"]

    length_different = len(real_foods) - len(expected_food_items)

    if length_different == 0:
        individual_metrics: List[Dict[str, float]] = []
        for real_food, expected_food_item in zip(
            real_foods, expected_food_items, strict=True
        ):
            ind_metric = individual_performance_metric(
                nlp, real_food, expected_food_item
            )
            individual_metrics.append(ind_metric)
    else:
        # as the number of real foods is different from the number of expected foods,
        # we need to try all the possible combinations
        combs = list(product(real_foods, expected_food_items))
        individual_metrics = pick_the_best_from_combinations(
            nlp, combs, len(expected_food_items)
        )

    if len(individual_metrics) == 0 and length_different == 0:
        # if there are no individual metrics and the length is 0, then the total score is 1
        total = 1
    else:
        # for normal cases the total score is the average.
        # for special cases where the cartisian product is 0, the total score is 0
        total = avg([x["total"] for x in individual_metrics])

    return {
        "individual_metrics": individual_metrics,
        "length_different": length_different,
        "total": total,
    }
