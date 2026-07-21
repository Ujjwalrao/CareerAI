import json

from groq import Groq

from app.config import settings

_client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None

# llama-3.3-70b-versatile: best quality/speed tradeoff on Groq's free tier
DEFAULT_MODEL = "llama-3.3-70b-versatile"


def chat_json(system_prompt: str, user_prompt: str, model: str = DEFAULT_MODEL) -> dict:
    """
    Calls Groq with a system+user prompt and expects strict JSON back.
    Used wherever we need structured output (e.g. resume field extraction).
    """
    if not _client:
        raise RuntimeError("GROQ_API_KEY not configured")

    completion = _client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt + "\nRespond ONLY with valid JSON, no markdown fences, no preamble."},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    raw = completion.choices[0].message.content
    return json.loads(raw)


def chat_text(system_prompt: str, user_prompt: str, model: str = DEFAULT_MODEL) -> str:
    if not _client:
        raise RuntimeError("GROQ_API_KEY not configured")

    completion = _client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
    )
    return completion.choices[0].message.content
