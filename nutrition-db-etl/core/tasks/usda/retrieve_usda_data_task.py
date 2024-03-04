from typing import Any, Dict, List

from core.data_loaders.definitions import USDARawRepository
from core.tasks.generic_task import GenericTask


class RetrieveUSDADataTask(GenericTask):

    def get_raw_usda_foods(
        self, repository: USDARawRepository, key: str
    ) -> List[Dict[str, Any]]:
        self.logger.info("retrieving data from repository")
        data = repository.retrieve(key)
        self.logger.info(f"retrieved {len(data)} records")
        self.logger.info(f"number of records retrieved: {len(data)}")
        return data
