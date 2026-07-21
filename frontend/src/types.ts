export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface ResumeVersion {
  id: string;
  role: string;
  score: number;
  updatedAt: string;
  summary: string;
  experience: {
    company: string;
    role: string;
    period: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    period: string;
  }[];
  skills: string[];
}

export interface Application {
  id: string;
  company: string;
  role: string;
  appliedDate: string;
  status: 'Applied' | 'Interview' | 'Offer' | 'Rejected';
  resumeTag: string;
  salary?: string;
  notes?: string;
}

export interface ScoreTrend {
  week: string;
  resumeScore: number;
  readinessScore: number;
}

export interface TargetRoleGap {
  role: string;
  skills: { name: string; current: number; target: number }[];
  milestones: { title: string; timeframe: string; description: string; resources: { name: string; url: string }[] }[];
}

export interface InterviewExchange {
  id: string;
  role: string;
  question: string;
  sampleAnswer: string;
  feedback: {
    score: number;
    strengths: string[];
    gaps: string[];
    betterWording: string;
  };
}

export interface GeneratedContent {
  id: string;
  role: string;
  type: 'cover-letter' | 'linkedin-about' | 'cold-outreach';
  tone: 'Formal' | 'Confident' | 'Warm';
  body: string;
}
