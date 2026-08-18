from collections.abc import MutableSequence
from typing import Any

_MEMORY: MutableSequence[dict[str, Any]] = []


def store_interaction(item: dict[str, Any]) -> None:
    _MEMORY.append(item)
