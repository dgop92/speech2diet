import logging
from typing import Any, Dict, List

from prefect import flow, get_run_logger, task, variables
from prefect.blocks.system import Secret

from core.data_exporters.mongo_repository import NutritionMongoRepository
from core.data_loaders.s3_repository import BedcaS3Repository
from core.entities.clean_food import CleanKeywordFood
from core.entities.common_food import CommonFood
from core.tasks.bedca.map_bedca_data_to_comon_food_task import (
    MapBedcaDataToCommonFoodTask,
)
from core.tasks.bedca.retrieve_bedca_data_task import RetrieveBedcaDataTask
from core.tasks.common.create_clean_food_task import CreateCleanFoodTask
from core.tasks.common.save_in_dest_db_task import SaveFoodsInDestTask
from infrastructure.utils import build_clean_function


def get_secret(envname: str, secret_name: str) -> str:
    return Secret.load(f"{envname}-{secret_name}").get()


@task(retries=2)
def retrieve_bedca_data_task() -> List[Dict[str, Any]]:
    logger: logging.Logger = get_run_logger()
    env_name: str = variables.get("environment")
    core_task = RetrieveBedcaDataTask(logger=logger, env_name=env_name)
    bucket_name: str = Secret.load("s3-bucket-name").get()
    acess_key: str = Secret.load("s3-aws-access-key").get()
    secret_key: str = Secret.load("s3-aws-secret-key").get()
    key = get_secret(env_name, "bedca-s3-key")
    repo = BedcaS3Repository(
        bucket_name=bucket_name, access_key=acess_key, secret_key=secret_key
    )
    return core_task.get_raw_bedca_foods(repository=repo, key=key)


@task(retries=1)
def map_bedca_data_to_comon_food_task(
    bedca_data: List[Dict[str, Any]]
) -> List[CommonFood]:
    logger: logging.Logger = get_run_logger()
    env_name: str = variables.get("environment")

    core_task = MapBedcaDataToCommonFoodTask(logger=logger, env_name=env_name)
    results = core_task.map_bedca_data_to_common_food(bedca_data=bedca_data)

    return results


@task(retries=1)
def create_clean_food_task(common_foods: List[CommonFood]) -> List[CleanKeywordFood]:
    logger: logging.Logger = get_run_logger()
    env_name: str = variables.get("environment")
    logger.info("building clean function")
    clean_keyword_func = build_clean_function()
    logger.info("clean function built")
    core_task = CreateCleanFoodTask(
        logger=logger, env_name=env_name, clean_keyword_func=clean_keyword_func
    )
    return core_task.create_clean_food(common_foods=common_foods)


@task(retries=2)
def save_in_dest_db_task(foods: List[CleanKeywordFood]) -> None:
    logger: logging.Logger = get_run_logger()
    env_name: str = variables.get("environment")
    core_task = SaveFoodsInDestTask(logger=logger, env_name=env_name)
    repo = NutritionMongoRepository(
        mongo_uri=Secret.load("nutrition-mongo-uri").get(),
        db_name=Secret.load("nutrition-mongo-db-name").get(),
        collection_name=Secret.load("nutrition-mongo-collection-name").get(),
    )
    core_task.save_foods(repository=repo, foods=foods)


@flow(name="bedca_pipeline")
def bedca_pipeline() -> None:
    logger = get_run_logger()
    logger.info("starting bedca pipeline")
    logger.info("retrieving raw bedca data")
    bedca_data = retrieve_bedca_data_task()
    logger.info("mapping bedca data to common food model")
    common_foods = map_bedca_data_to_comon_food_task(bedca_data=bedca_data)
    logger.info("creating clean food model")
    clean_foods = create_clean_food_task(common_foods=common_foods)
    logger.info("saving clean food model in destination db")
    save_in_dest_db_task(foods=clean_foods)


if __name__ == "__main__":
    bedca_pipeline()
