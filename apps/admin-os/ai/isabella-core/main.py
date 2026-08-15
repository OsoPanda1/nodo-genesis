from datetime import datetime
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel

from agents.router import route
from memory.context import store_interaction

app = FastAPI(title="ISABELLA Urban Orchestrator")


class Message(BaseModel):
    user_id: str | None = None
    role: str = "user"
    text: str
    context: dict | None = None


class Input(BaseModel):
    text: str
    user_id: str | None = None


class IsabellaResponse(BaseModel):
    response: str
    sentiment: str
    intent: str
    timestamp: str


def detect_intent(text: str) -> str:
    lowered = text.lower()
    if "dicho" in lowered:
        return "DICHO_TRADICION"
    if "ruta" in lowered or "tour" in lowered:
        return "RUTA_TURISTICA"
    if "comprar" in lowered or "pagar" in lowered:
        return "COMPRA"
    return "CHAT_GENERAL"


@app.post("/query")
async def query(input: Input):
    intent = detect_intent(input.text)
    result = route(intent, input.text)

    interaction_id = str(uuid4())
    store_interaction(
        {
            "id": interaction_id,
            "text": input.text,
            "intent": intent,
            "response": result["response"],
        }
    )

    return {
        "id": interaction_id,
        "response": result["response"],
        "intent": intent,
        "meta": result.get("meta", {}),
    }


@app.post("/urban-chat", response_model=IsabellaResponse)
def urban_chat(msg: Message):
    intent = detect_intent(msg.text)
    result = route(intent, msg.text)

    sentiment = "positivo" if any(w in msg.text.lower() for w in ["gracias", "increíble", "bonito"]) else "neutral"

    return IsabellaResponse(
        response=result["response"],
        sentiment=sentiment,
        intent=intent,
        timestamp=datetime.utcnow().isoformat(),
    )
