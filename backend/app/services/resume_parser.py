import re
import io

import pdfplumber
import docx

from app.services.llm import chat_json

EXTRACTION_SYSTEM_PROMPT = """You are a resume parser. Extract structured data from raw resume text.
Return JSON with exactly this shape:
{
  "role": "string - the person's most recent/primary job title",
  "summary": "string - 2-3 sentence professional summary",
  "experience": [{"company": "string", "role": "string", "period": "string", "bullets": ["string"]}],
  "education": [{"institution": "string", "degree": "string", "period": "string"}],
  "skills": ["string"]
}
Only use information present in the text. Do not invent companies, dates, or skills."""


def extract_raw_text(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split(".")[-1]

    if ext == "pdf":
        text_parts = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n".join(text_parts)

    if ext == "docx":
        doc = docx.Document(io.BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs if p.text.strip())

    raise ValueError(f"Unsupported file type: .{ext}. Upload a PDF or DOCX.")


def basic_regex_signals(raw_text: str) -> dict:
    """Cheap, deterministic signals used both standalone and as a sanity check
    on the LLM output — doesn't cost any Groq quota."""
    email_match = re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", raw_text)
    phone_match = re.search(r"(\+?\d[\d\-\s()]{8,}\d)", raw_text)
    return {
        "email": email_match.group(0) if email_match else None,
        "phone": phone_match.group(0) if phone_match else None,
        "word_count": len(raw_text.split()),
    }


def parse_resume_to_structured(file_bytes: bytes, filename: str) -> dict:
    raw_text = extract_raw_text(file_bytes, filename)
    if not raw_text.strip():
        raise ValueError("Could not extract any text — the file may be a scanned image without a text layer.")

    structured = chat_json(EXTRACTION_SYSTEM_PROMPT, raw_text[:12000])

    # Defensive defaults in case the LLM omits a field
    structured.setdefault("role", "Unspecified Role")
    structured.setdefault("summary", "")
    structured.setdefault("experience", [])
    structured.setdefault("education", [])
    structured.setdefault("skills", [])

    return structured


def score_resume(structured: dict) -> float:
    """Rule-based ATS-friendliness score — no LLM call needed, saves Groq quota."""
    score = 40.0

    bullets = [b for exp in structured.get("experience", []) for b in exp.get("bullets", [])]
    if bullets:
        quantified = sum(1 for b in bullets if re.search(r"\d", b))
        score += min(25, quantified * 4)

        action_verbs = {"led", "built", "designed", "improved", "reduced", "increased",
                         "launched", "created", "managed", "optimized", "developed", "implemented"}
        verb_hits = sum(1 for b in bullets if b.strip().split(" ")[0].lower() in action_verbs)
        score += min(15, verb_hits * 3)

    skills = structured.get("skills", [])
    score += min(15, len(skills))

    if structured.get("summary"):
        score += 5

    return round(min(98, score), 1)
