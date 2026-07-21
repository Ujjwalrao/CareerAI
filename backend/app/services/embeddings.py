from google import genai
from google.genai import types

from app.config import settings

_client = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None

# gemini-embedding-001: current recommended embedding model, replaces the
# retired text-embedding-004. 768 dims to match Resume.embedding's column size.
EMBED_MODEL = "gemini-embedding-001"
EMBED_DIMENSIONS = 768


def embed_text(text: str) -> list[float]:
    if not _client:
        raise RuntimeError("GEMINI_API_KEY not configured")

    # Truncate defensively — embedding models have input token limits and
    # resumes/JDs can be long; first ~8000 chars is plenty of signal
    result = _client.models.embed_content(
        model=EMBED_MODEL,
        contents=text[:8000],
        config=types.EmbedContentConfig(output_dimensionality=EMBED_DIMENSIONS),
    )
    return result.embeddings[0].values
