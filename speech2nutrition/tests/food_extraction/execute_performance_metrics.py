import argparse
import json
import logging
import os
from typing import Any, Dict, List, Tuple

import spacy

from config.logging import config_logger
from core.components.food_extraction.factory import food_extraction_component_factory
from tests.food_extraction.cases import TEST_SETS
from tests.food_extraction.metrics import evaluate_test_case
from tests.food_extraction.test_sets.definitions import FoodExtractionTestCase


def save_results(test_set_id: str, results: List[Dict[str, Any]]) -> None:
    results_path = os.path.join("tests/data", "fe_results", f"test--{test_set_id}.json")
    os.makedirs(os.path.dirname(results_path), exist_ok=True)
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)


def load_results(test_set_id: str) -> List[Dict[str, Any]] | None:
    results_path = os.path.join("tests/data", "fe_results", f"test--{test_set_id}.json")
    if not os.path.exists(results_path):
        return None
    with open(results_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Execute performance metrics for the food extraction service"
    )

    parser.add_argument(
        "--test_set_id",
        type=str,
        help="The id of the test set to execute. use all to get all test sets",
        default="check",
    )
    args = parser.parse_args()

    id_test_set_list: List[Tuple[str, List[FoodExtractionTestCase]]] = []
    if args.test_set_id != "all":
        test_set_case = TEST_SETS.get(args.test_set_id, None)
        if test_set_case is None:
            raise ValueError(f"test set id {args.test_set_id} not found")
        id_test_set_list.append((args.test_set_id, test_set_case))
    else:
        id_test_set_list = list(TEST_SETS.items())

    logger.info("loading spanish model for spacy")
    spacy_language = spacy.load("es_core_news_sm")

    logger.info("creating food extraction component")
    food_extraction_component = food_extraction_component_factory()

    all_results: List[Tuple[str, List[Dict[str, Any]]]] = []
    for test_set_id, test_set in id_test_set_list:
        logger.info(f"executing test set with id: {test_set_id}")

        loaded_results = load_results(test_set_id)
        if loaded_results is None:
            logger.info(f"test set with id: '{test_set_id}' not found, executing")
            results = []
            for test_case in test_set:
                logger.info(f"executing test case '{test_case['input_text']}'")

                try:
                    found_foods = food_extraction_component(test_case["input_text"])
                except Exception as e:
                    logger.warning(
                        f"Error executing test case {test_case['input_text']}",
                        exc_info=True,
                    )
                    found_foods = []

                test_case_results = evaluate_test_case(
                    spacy_language, test_case, found_foods
                )
                results.append(
                    {
                        "test_case_input_text": test_case["input_text"],
                        "test_case": [
                            food_item["food"].dict()
                            for food_item in test_case["expected_foods_items"]
                        ],
                        "found_foods": [food.dict() for food in found_foods],
                        **test_case_results,
                    }
                )
            save_results(test_set_id, results)
            all_results.append((test_set_id, results))
        else:
            logger.info(f"test set '{test_set_id}' found, skipping")
            all_results.append((test_set_id, loaded_results))

    for test_set_id, results in all_results:
        total = 0
        for result in results:
            test_id_total = result["total"]
            logger.info(f"test set id: '{test_set_id}' - total score: {test_id_total}")

            total += test_id_total

    logger.info(f"total score: {total}")


if __name__ == "__main__":
    config_logger()
    logger = logging.getLogger(__name__)
    logger.info("logger setup")
    main()
