from app.services.llm import chat_text

_TYPE_INSTRUCTIONS = {
    "cover-letter": (
        "Write a professional cover letter for the role of {role}. "
        "Open with genuine interest, reference 1-2 concrete achievements from the candidate's "
        "background below, and close with a confident call to action. Keep it under 300 words."
    ),
    "linkedin-about": (
        "Write a LinkedIn 'About' section for someone targeting the role of {role}. "
        "First-person, 3-4 short paragraphs, highlight impact and specialization. Keep it under 200 words."
    ),
    "cold-outreach": (
        "Write a short cold outreach DM/email to a recruiter or hiring manager about the role of {role}. "
        "Warm, specific, no generic flattery, end with a clear low-friction ask. Keep it under 120 words."
    ),
}

_TONE_GUIDANCE = {
    "Formal": "Use a formal, polished, business-appropriate tone.",
    "Confident": "Use a confident, assertive tone that showcases achievements directly.",
    "Warm": "Use a warm, personable, conversational tone while staying professional.",
}


def generate_content(content_type: str, role: str, tone: str, resume_context: str = "", jd_text: str = "") -> str:
    if content_type not in _TYPE_INSTRUCTIONS:
        raise ValueError(f"Unknown content type: {content_type}")

    instruction = _TYPE_INSTRUCTIONS[content_type].format(role=role)
    tone_line = _TONE_GUIDANCE.get(tone, "Use a professional tone.")

    system_prompt = (
        f"You are an expert career writer. {instruction} {tone_line} "
        "Do not invent specific companies, dates, or numbers that aren't in the candidate's background — "
        "if details are missing, keep language general rather than fabricating specifics."
    )

    user_prompt = f"Candidate background:\n{resume_context or 'No resume details provided — write a general version.'}"
    if jd_text:
        user_prompt += f"\n\nTarget job description (reference relevant points naturally):\n{jd_text[:3000]}"

    return chat_text(system_prompt, user_prompt)
