from app.services.llm import chat_json

NEGOTIATION_SYSTEM_PROMPT = """You are roleplaying as a recruiter in a salary negotiation simulator.
The candidate just sent a negotiation message. Respond in character as the recruiter — realistic,
professional, sometimes pushing back, sometimes conceding a bit. Return JSON with exactly this shape:
{
  "responseText": "string - the recruiter's in-character reply, 2-4 sentences",
  "sentiment": "reluctant" | "neutral" | "favorable",
  "suggestedIncreasePercent": number - how much (as a % of current offer, 0 to 8) the recruiter is
    conceding in this message. Use 0 if they're pushing back or the message wasn't a clear ask.
}
Be realistic — don't concede more than a modest amount in any single exchange, and don't concede at all
if the candidate's message is vague, aggressive, or unreasonable."""

MAX_SINGLE_INCREASE_PCT = 8.0
CEILING_MULTIPLIER = 1.35  # recruiter won't go above 35% over the starting offer in this simulation


def simulate_negotiation(message: str, current_offer: float, starting_offer: float) -> dict:
    user_prompt = f"Current offer on the table: ${current_offer:,.0f}\nCandidate's message: {message}"
    result = chat_json(NEGOTIATION_SYSTEM_PROMPT, user_prompt)

    increase_pct = min(MAX_SINGLE_INCREASE_PCT, max(0.0, result.get("suggestedIncreasePercent", 0)))
    ceiling = starting_offer * CEILING_MULTIPLIER
    counter_offer = min(ceiling, current_offer * (1 + increase_pct / 100))

    return {
        "responseText": result.get("responseText", "Let me check with the team and get back to you."),
        "counterOffer": round(counter_offer, -2),  # round to nearest $100, feels more realistic than exact
        "sentiment": result.get("sentiment", "neutral"),
    }
