from typing import Any, Dict, List, Protocol


class USDARawRepository(Protocol):

    def retrieve(self, key: str) -> List[Dict[str, Any]]: ...
