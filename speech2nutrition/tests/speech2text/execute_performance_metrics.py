import argparse
import json
import logging
import os
from typing import Any, Dict, List, Tuple

from config.logging import config_logger
from core.components.speech2text.factory import speech2text_component_factory
from tests.speech2text.cases import KEYWORD_TEST_SETS, UNIT_AMOUNT_TEST_SETS
from tests.speech2text.metrics import (
    evaluate_test_case_amount_unit,
    evaluate_test_case_keywords,
)
from tests.speech2text.test_sets.definitions import (
    ExpectedS2TFoodKeywordsCase,
    ExpectedS2TFoodUnitAmountCase,
)


def save_results(test_set_id: str, results: List[Dict[str, Any]]) -> None:
    results_path = os.path.join(
        "tests/data", "s2t_results", f"test--{test_set_id}.json"
    )
    os.makedirs(os.path.dirname(results_path), exist_ok=True)
    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4, ensure_ascii=False)


def load_results(test_set_id: str) -> List[Dict[str, Any]] | None:
    results_path = os.path.join(
        "tests/data", "s2t_results", f"test--{test_set_id}.json"
    )
    if not os.path.exists(results_path):
        return None
    with open(results_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Execute performance metrics for the speech to text component"
    )

    parser.add_argument(
        "--test-set-id",
        type=str,
        help="The id of the test set to execute. use all to get all test sets",
        default="check",
    )
    args = parser.parse_args()

    id_test_set_list: List[
        Tuple[
            str, List[ExpectedS2TFoodKeywordsCase] | List[ExpectedS2TFoodUnitAmountCase]
        ]
    ] = []
    if args.test_set_id != "all":
        keyword_test_set_case = KEYWORD_TEST_SETS.get(args.test_set_id, None)
        amount_unit_test_set_case = UNIT_AMOUNT_TEST_SETS.get(args.test_set_id, None)

        if keyword_test_set_case is not None:
            id_test_set_list.append((args.test_set_id, keyword_test_set_case))

        if amount_unit_test_set_case is not None:
            id_test_set_list.append((args.test_set_id, amount_unit_test_set_case))

        if keyword_test_set_case is None and amount_unit_test_set_case is None:
            raise ValueError(
                f"test set id {args.test_set_id} not found in any test set"
            )
    else:
        id_test_set_list = [
            *list(KEYWORD_TEST_SETS.items()),
            *list(UNIT_AMOUNT_TEST_SETS.items()),
        ]

    logger.info("creating speech2text component")
    speech2text_component = speech2text_component_factory()

    all_results: List[Tuple[str, List[Dict[str, Any]]]] = []
    n_tests = 0

    for test_set_id, test_set in id_test_set_list:
        logger.info(f"executing test set with id: {test_set_id}")
        n_tests += len(test_set)
        loaded_results = load_results(test_set_id)

        if loaded_results is None:
            logger.info(f"test set with id: '{test_set_id}' not found, executing")
            results = []
            for test_case in test_set:
                try:
                    final_id = f"test-audios/{test_set_id}/{test_case['audio_id']}.mp3"
                    raw_transcription = speech2text_component(final_id)
                except Exception as e:
                    logger.warning(
                        f"error executing test case {test_case['audio_id']}",
                        exc_info=True,
                    )
                    raw_transcription = ""

                if "keywords" in test_case:
                    result = evaluate_test_case_keywords(
                        raw_transcription=raw_transcription, test_case=test_case
                    )
                else:
                    result = evaluate_test_case_amount_unit(
                        raw_transcription=raw_transcription, test_case=test_case
                    )

                results.append(
                    {
                        "test_case_id": test_case["audio_id"],
                        "raw_transcription": raw_transcription,
                        **result,
                    }
                )

            save_results(test_set_id, results)
            all_results.append((test_set_id, results))
        else:
            logger.info(f"test set '{test_set_id}' found, skipping")
            all_results.append((test_set_id, loaded_results))

    all_individual_metrics = []
    for test_set_id, results in all_results:
        current_description_score = 0
        current_amount_score = 0
        current_unit_score = 0
        for result in results:
            current_description_score += result.get("keyword_metric", 0)
            current_amount_score += result.get("amount_metric", 0)
            current_unit_score += result.get("unit_metric", 0)

        all_individual_metrics.append(
            {
                "test_set_id": test_set_id,
                "n_tests": len(results),
                "description_score": current_description_score / len(results),
                "amount_score": current_amount_score / len(results),
                "unit_score": current_unit_score / len(results),
            }
        )

    logger.info(f"number of tests: {n_tests}")
    logger.info(json.dumps(all_individual_metrics, indent=4, ensure_ascii=False))
    save_results("individual_metrics", all_individual_metrics)


if __name__ == "__main__":
    config_logger()
    logger = logging.getLogger(__name__)
    logger.info("logger setup")
    main()
