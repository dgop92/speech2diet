from typing import IO, Any, Dict, List, Protocol


class USDARawRepository(Protocol):

    def retrieve(self, key: str) -> List[Dict[str, Any]]:
        """Retrieve data from the repository as a list of dictionaries."""
        ...


class BedcaRawRepository(Protocol):

    def retrieve(self, key: str) -> IO[bytes]:
        """Retrieve data from the repository as zip file encoded in bytes."""
        ...
