from typing import List, Optional
from pydantic import BaseModel, EmailStr


# ---- Auth ----
class UserProfile(BaseModel):
    name: str
    email: str
    avatarUrl: Optional[str] = None

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile


# ---- Resume (mirrors src/types.ts ResumeVersion) ----
class ExperienceItem(BaseModel):
    company: str
    role: str
    period: str
    bullets: List[str]


class EducationItem(BaseModel):
    institution: str
    degree: str
    period: str


class ResumeVersion(BaseModel):
    id: str
    role: str
    score: float
    updatedAt: str
    summary: str
    experience: List[ExperienceItem]
    education: List[EducationItem]
    skills: List[str]

    class Config:
        from_attributes = True


# ---- JD Matching (mirrors analyzeJobMatch return type) ----
class MatchRequest(BaseModel):
    jdText: str
    resumeId: str


class MatchResponse(BaseModel):
    score: float
    inResume: List[str]
    missingFromJD: List[str]


# ---- Gap Analysis (mirrors src/types.ts TargetRoleGap) ----
class SkillGapItem(BaseModel):
    name: str
    current: float
    target: float


class Resource(BaseModel):
    name: str
    url: str


class Milestone(BaseModel):
    title: str
    timeframe: str
    description: str
    resources: List[Resource]


class TargetRoleGap(BaseModel):
    role: str
    skills: List[SkillGapItem]
    milestones: List[Milestone]


class GapAnalysisRequest(BaseModel):
    resumeId: str
    targetRole: Optional[str] = None  # defaults to the resume's own role if omitted


# ---- Content Generator (mirrors generateContent) ----
class ContentRequest(BaseModel):
    type: str          # 'cover-letter' | 'linkedin-about' | 'cold-outreach'
    role: str
    tone: str           # 'Formal' | 'Confident' | 'Warm'
    resumeId: Optional[str] = None   # used for personalization if provided
    jdText: Optional[str] = None     # optional — sharpens cover letters when a JD is pasted


class ContentResponse(BaseModel):
    body: str


# ---- Mock Interview (mirrors src/types.ts InterviewExchange) ----
class InterviewFeedback(BaseModel):
    score: float
    strengths: List[str]
    gaps: List[str]
    betterWording: str


class InterviewExchange(BaseModel):
    id: str
    role: str
    question: str
    sampleAnswer: str
    feedback: InterviewFeedback

    class Config:
        from_attributes = True


class InterviewAnswerRequest(BaseModel):
    questionId: str
    answer: str


# ---- Application Tracker (mirrors src/types.ts Application) ----
class Application(BaseModel):
    id: str
    company: str
    role: str
    appliedDate: str
    status: str  # 'Applied' | 'Interview' | 'Offer' | 'Rejected'
    resumeTag: str
    salary: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    company: str
    role: str
    appliedDate: str
    status: str = "Applied"
    resumeTag: str = ""
    salary: Optional[str] = None
    notes: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: str


# ---- Telegram linking ----
class TelegramLinkResponse(BaseModel):
    linkCode: str
    botDeepLink: str
    linked: bool


# ---- Salary Negotiation Simulator (mirrors simulateNegotiation) ----
class NegotiationRequest(BaseModel):
    message: str
    currentOffer: float
    startingOffer: Optional[float] = None  # anchors the negotiation ceiling; defaults to currentOffer on the first turn


class NegotiationResponse(BaseModel):
    responseText: str
    counterOffer: float
    sentiment: str  # 'reluctant' | 'neutral' | 'favorable'


# ---- Analytics (optional server-side aggregation, e.g. for weekly email reports) ----
class AnalyticsSummary(BaseModel):
    totalResumes: int
    totalApplications: int
    interviewCount: int
    offerCount: int
    rejectedCount: int
    avgResumeScore: float
    responseRate: float  # (interview+offer+rejected) / total, i.e. non-silent responses
