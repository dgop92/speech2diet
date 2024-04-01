import zipfile
from io import BytesIO
from typing import Any, Dict, List

from core.data_loaders.definitions import BedcaRawRepository
from core.tasks.bedca.xml_reader import get_food_item_data_from_xml_file
from core.tasks.generic_task import GenericTask


class RetrieveBedcaDataTask(GenericTask):

    def get_raw_bedca_foods(
        self, repository: BedcaRawRepository, key: str
    ) -> List[Dict[str, Any]]:

        self.logger.info("retrieving data from repository")
        data = repository.retrieve(key)

        self.logger.info("reading xml food files from zip file")
        xml_files_as_iobytes: List[BytesIO] = []
        with zipfile.ZipFile(data, "r") as zip_ref:
            for file in zip_ref.namelist():
                if file.endswith(".xml"):
                    # read the file
                    with zip_ref.open(file) as xml_file:
                        xml_files_as_iobytes.append(BytesIO(xml_file.read()))
        self.logger.info(f"found {len(xml_files_as_iobytes)} xml files in the zip file")

        self.logger.info("extracting food data from xml files")
        food_items = []
        for xml_file in xml_files_as_iobytes:
            try:
                food_items.append(get_food_item_data_from_xml_file(xml_file))
            except Exception as e:
                self.logger.warning(f"error processing xml file: {e}", exc_info=True)

        return food_items
