import json
import re
from pathlib import Path

from app.services.llm import chat_json

_GRAPH_PATH = Path(__file__).parent.parent / "data" / "skill_graphs.json"
with open(_GRAPH_PATH) as f:
    SKILL_GRAPHS: dict = json.load(f)

MILESTONE_SYSTEM_PROMPT = """You are a career coach. Given a target role and a list of skill
gaps (current level vs target level, 0-100 scale), produce a realistic 3-milestone learning
roadmap spanning about 6 months. Return JSON with exactly this shape:
{
  "milestones": [
    {
      "title": "string - short milestone name, e.g. 'Month 1-2: Close the X gap'",
      "timeframe": "string, e.g. 'Weeks 1-8'",
      "description": "string - 1-2 sentences on what to focus on and why",
      "resources": [{"name": "string - real, well-known resource name", "url": "string - a real, plausible URL for that resource"}]
    }
  ]
}
Prioritize the skills with the largest gap (target - current) first. Keep resources to 1-2 per milestone,
and only recommend genuinely well-known learning resources (official docs, well-known courses/books)."""


def _find_closest_role_key(target_role: str) -> str:
    target_lower = target_role.lower()
    for key in SKILL_GRAPHS:
        if key == "generic":
            continue
        # match if any significant word from the role overlaps with the graph key
        if key in target_lower or any(word in target_lower for word in key.split("/")):
            return key
    return "generic"


def _estimate_current_level(skill_name: str, resume_skills: list[str], resume_text_blob: str) -> float:
    """Deterministic heuristic — no LLM call. If the exact/partial skill name
    appears in the resume's skill list, weight it high; if it only appears in
    free text (summary/experience), weight it medium; otherwise low."""
    skill_lower = skill_name.lower()
    skill_tokens = re.findall(r"[a-z0-9+]+", skill_lower)

    for rs in resume_skills:
        rs_lower = rs.lower()
        if skill_lower in rs_lower or rs_lower in skill_lower:
            return 78.0
        if any(tok in rs_lower for tok in skill_tokens if len(tok) > 3):
            return 65.0

    if any(tok in resume_text_blob for tok in skill_tokens if len(tok) > 3):
        return 45.0

    return 20.0


def compute_gap_analysis(structured_resume: dict, target_role: str) -> dict:
    graph_key = _find_closest_role_key(target_role)
    skill_targets = SKILL_GRAPHS[graph_key]

    resume_skills = structured_resume.get("skills", [])
    text_blob = " ".join(
        [structured_resume.get("summary", "")]
        + [b for exp in structured_resume.get("experience", []) for b in exp.get("bullets", [])]
    ).lower()

    skills_with_gap = [
        {
            "name": item["name"],
            "current": _estimate_current_level(item["name"], resume_skills, text_blob),
            "target": item["target"],
        }
        for item in skill_targets
    ]

    # Sort gaps largest-first so the LLM prioritizes correctly
    sorted_for_prompt = sorted(skills_with_gap, key=lambda s: s["target"] - s["current"], reverse=True)
    milestone_input = json.dumps({"targetRole": target_role, "gaps": sorted_for_prompt})

    result = chat_json(MILESTONE_SYSTEM_PROMPT, milestone_input)
    milestones = result.get("milestones", [])

    return {
        "role": target_role,
        "skills": skills_with_gap,
        "milestones": milestones,
    }
