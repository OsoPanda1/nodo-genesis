from typing import Any


def tourism_agent(text: str) -> dict[str, Any]:
    return {"response": f"Ruta sugerida para ti: {text}", "meta": {"agent": "tourism"}}


def culture_agent(text: str) -> dict[str, Any]:
    return {"response": f"Dicho cultural encontrado para: {text}", "meta": {"agent": "culture"}}


def commerce_agent(text: str) -> dict[str, Any]:
    return {"response": f"Opciones de compra activas para: {text}", "meta": {"agent": "commerce"}}


def general_llm(text: str) -> dict[str, Any]:
    return {
        "response": "Soy ISABELLA, conciencia urbana de Real del Monte. ¿Qué te gustaría explorar hoy?",
        "meta": {"agent": "general", "echo": text},
    }


def route(intent: str, text: str) -> dict[str, Any]:
    if intent == "RUTA_TURISTICA":
        return tourism_agent(text)
    if intent == "DICHO_TRADICION":
        return culture_agent(text)
    if intent == "COMPRA":
        return commerce_agent(text)
    return general_llm(text)
