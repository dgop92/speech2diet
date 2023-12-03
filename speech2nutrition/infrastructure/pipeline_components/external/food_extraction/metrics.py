from typing import Dict, Set

from spacy.language import Language

from domain.entities.food_nutrition_request import FoodNutritionRequest
from infrastructure.food_mapping.clean_keyword import clean_description_keyword


def merge_food_name_description(nlp: Language, name: str, description: str) -> Set[str]:
    """
    Merge the food name and description into a single string and clean it
    """
    final_food_description = f"{name} {' '.join(description)}"
    clean_text = clean_description_keyword(nlp, final_food_description)
    return set(clean_text.split(" "))


def basic_food_extraction_performance_metric(
    nlp: Language, food: FoodNutritionRequest, expected_food: FoodNutritionRequest
) -> Dict[str, float]:
    """
    Basic food extraction performance metric based on three components:

    - food name and description accuracy
    - unit accuracy
    - amount accuracy

    For the food name and description accuracy we use the simple accuracy ignoring extra food words

    For the unit and amount accuracy we use a simple 1 if the unit or amount is the same and 0 otherwise
    """
    final_food_description = merge_food_name_description(
        nlp, food.food_name, food.description
    )
    expected_final_food_description = merge_food_name_description(
        nlp, expected_food.food_name, expected_food.description
    )
    # simple accuracy
    total = len(expected_final_food_description)
    correct = len(final_food_description.intersection(expected_final_food_description))

    food_keywords_accuracy = correct / total
    unit_score = 1 if food.unit == expected_food.unit else 0
    amount_score = 1 if food.amount == expected_food.amount else 0

    total_score = (food_keywords_accuracy + unit_score + amount_score) / 3

    return {
        "food_keywords_accuracy": food_keywords_accuracy,
        "unit_score": unit_score,
        "amount_score": amount_score,
        "total_score": total_score,
    }
