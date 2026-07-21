import re

from app.services.llm import chat_json

_FILLER_WORDS = {"um", "uh", "like", "you know", "basically", "actually", "sort of", "kind of"}

QUESTIONS_SYSTEM_PROMPT = """You are a senior technical interviewer. Generate exactly 3 progressive
interview questions for the given role — mix behavioral and technical/architectural, increasing in
difficulty. For each question also write a strong sample answer (what a great candidate would say).
Return JSON with exactly this shape:
{
  "questions": [
    {"question": "string", "sampleAnswer": "string - 2-4 sentences, ideally using the STAR method for behavioral ones"}
  ]
}"""

FEEDBACK_SYSTEM_PROMPT = """You are an interview coach evaluating a candidate's spoken/typed answer
against a strong reference answer. Score fairly on structure (STAR method for behavioral questions),
specificity, and use of concrete metrics. Return JSON with exactly this shape:
{
  "score": number (0-100),
  "strengths": ["string", "string"],
  "gaps": ["string", "string"],
  "betterWording": "string - one concrete rewritten sentence showing how to improve the weakest part"
}
Be honest and specific — do not inflate scores for vague or generic answers."""


def generate_questions(role: str, resume_context: str = "") -> list[dict]:
    user_prompt = f"Target role: {role}"
    if resume_context:
        user_prompt += f"\nCandidate background (tailor questions to this where relevant):\n{resume_context}"

    result = chat_json(QUESTIONS_SYSTEM_PROMPT, user_prompt)
    return result.get("questions", [])


def _filler_word_count(answer: str) -> int:
    lower = answer.lower()
    return sum(lower.count(fw) for fw in _FILLER_WORDS)


def generate_feedback(question: str, sample_answer: str, user_answer: str) -> dict:
    if len(user_answer.strip()) < 15:
        return {
            "score": 35,
            "strengths": ["Responded within the time given."],
            "gaps": ["Answer is too brief to evaluate structure or depth.", "No specific examples or metrics given."],
            "betterWording": "Expand using the STAR method: describe the Situation, Task, Action you took, and the measurable Result.",
        }

    filler_count = _filler_word_count(user_answer)
    has_numbers = bool(re.search(r"\d", user_answer))

    user_prompt = (
        f"Question: {question}\n\n"
        f"Reference (strong) answer: {sample_answer}\n\n"
        f"Candidate's actual answer: {user_answer}\n\n"
        f"Additional signals — filler word count: {filler_count}, contains quantified metrics: {has_numbers}"
    )

    result = chat_json(FEEDBACK_SYSTEM_PROMPT, user_prompt)
    result.setdefault("score", 60)
    result.setdefault("strengths", [])
    result.setdefault("gaps", [])
    result.setdefault("betterWording", "")
    return result
