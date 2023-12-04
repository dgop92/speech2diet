import logging
from typing import List

import spacy
from spacy.language import Language

from config.logging import config_logger
from domain.entities.food_nutrition_request import FoodNutritionRequest
from infrastructure.pipeline_components.external.food_extraction.gpt import (
    ChatGPTFoodExtractionService,
)
from infrastructure.pipeline_components.external.food_extraction.metrics import (
    basic_food_extraction_performance_metric,
)

logger = logging.getLogger(__name__)


def avg(lst):
    if len(lst) == 0:
        return 0
    return sum(lst) / len(lst)


def get_metrics(
    nlp: Language,
    foods: List[FoodNutritionRequest],
    expected_foods: List[FoodNutritionRequest],
):
    metrics = [
        basic_food_extraction_performance_metric(nlp, food, expected_food)
        for food, expected_food in zip(foods, expected_foods)
    ]

    food_keywords_accuracies = [metric["food_keywords_accuracy"] for metric in metrics]
    unit_scores = [metric["unit_score"] for metric in metrics]
    amount_scores = [metric["amount_score"] for metric in metrics]

    return avg(food_keywords_accuracies), avg(unit_scores), avg(amount_scores)


def successful_food_extraction_1(
    nlp: Language, gpt_service: ChatGPTFoodExtractionService
):
    text = "Hoy desayuné 2 rebanadas de pan blanco tajado con un huevo revuelto, además para beber, un vaso de jugo de mora con 2 cucharadas de azúcar"

    food1 = FoodNutritionRequest(
        food_name="pan",
        description=["blanco", "tajado"],
        amount=2,
        unit="rebanadas",
    )
    food2 = FoodNutritionRequest(
        food_name="huevo", description=["revuelto"], amount=1, unit=""
    )
    food3 = FoodNutritionRequest(
        food_name="jugo",
        description=["mora"],
        amount=1,
        unit="vaso",
    )
    food4 = FoodNutritionRequest(
        food_name="azúcar",
        description=[],
        amount=2,
        unit="cucharadas",
    )

    expected_foods = [food1, food2, food3, food4]
    foods = gpt_service.extract_foods_from_text(text)

    metrics = get_metrics(nlp, foods, expected_foods)
    return metrics


def successful_food_extraction_2(
    nlp: Language, gpt_service: ChatGPTFoodExtractionService
):
    text = "Estoy almorzando 100 gramos de arroz blanco y un pollo frito"

    food1 = FoodNutritionRequest(
        food_name="arroz",
        description=["blanco"],
        amount=100,
        unit="gramos",
    )
    food2 = FoodNutritionRequest(
        food_name="pollo",
        description=["frito"],
        amount=1,
        unit="",
    )

    expected_foods = [food1, food2]
    foods = gpt_service.extract_foods_from_text(text)

    metrics = get_metrics(nlp, foods, expected_foods)
    return metrics


def successful_food_extraction_3(
    nlp: Language, gpt_service: ChatGPTFoodExtractionService
):
    text = "Hoy desayuné 80 gramos de panqueques con 300 ml de jugo de mora"

    food1 = FoodNutritionRequest(
        food_name="panqueques",
        description=[],
        amount=80,
        unit="gramos",
    )

    food2 = FoodNutritionRequest(
        food_name="jugo",
        description=["mora"],
        amount=300,
        unit="ml",
    )

    expected_foods = [food1, food2]
    foods = gpt_service.extract_foods_from_text(text)

    metrics = get_metrics(nlp, foods, expected_foods)
    return metrics


if __name__ == "__main__":
    config_logger()
    logger.info("loading chatgpt service")
    gpt_service = ChatGPTFoodExtractionService()
    logger.info("loading spacy model for spanish")
    nlp = spacy.load("es_core_news_sm")

    logger.info("running food_extraction")
    data1 = successful_food_extraction_1(nlp, gpt_service)
    data2 = successful_food_extraction_2(nlp, gpt_service)
    data3 = successful_food_extraction_3(nlp, gpt_service)
    food_keywords_accuracies = [data1[0], data2[0], data3[0]]
    unit_scores = [data1[1], data2[1], data3[1]]
    amount_scores = [data1[2], data2[2], data3[2]]

    food_keywords_accuracy = avg(food_keywords_accuracies)
    unit_score = avg(unit_scores)
    amount_score = avg(amount_scores)

    logger.info(
        f"food_keywords_accuracy: {food_keywords_accuracy}, unit_score: {unit_score}, amount_score: {amount_score}"
    )
