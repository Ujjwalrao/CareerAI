import { ResumeVersion, Application, TargetRoleGap, InterviewExchange, UserProfile } from '../types';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUpload, setToken, clearToken } from './apiClient';

// ---------------- Auth ----------------
export async function registerUser(name: string, email: string, password: string): Promise<UserProfile> {
  const data = await apiPost('/api/auth/register', { name, email, password }, false);
  setToken(data.access_token);
  return data.user;
}

export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const data = await apiPost('/api/auth/login', { email, password }, false);
  setToken(data.access_token);
  return data.user;
}

export async function loginWithGoogle(credential: string): Promise<UserProfile> {
  const data = await apiPost('/api/auth/google', { credential }, false);
  setToken(data.access_token);
  return data.user;
}

export function logoutUser() {
  clearToken();
}

export async function getCurrentUser(): Promise<UserProfile> {
  return apiGet('/api/auth/me');
}

// ---------------- Resume Intelligence ----------------
export async function parseResume(file: File): Promise<ResumeVersion> {
  return apiUpload('/api/resumes/parse', file);
}

export async function getResumeVersions(): Promise<ResumeVersion[]> {
  return apiGet('/api/resumes');
}

export async function saveResume(resume: ResumeVersion): Promise<ResumeVersion> {
  return apiPut(`/api/resumes/${resume.id}`, resume);
}

// ---------------- Application Tracker ----------------
export async function getApplications(): Promise<Application[]> {
  return apiGet('/api/applications');
}

export async function createApplication(app: Omit<Application, 'id'>): Promise<Application> {
  return apiPost('/api/applications', app);
}

export async function updateApplicationApi(app: Application): Promise<Application> {
  return apiPut(`/api/applications/${app.id}`, app);
}

export async function updateApplicationStatusApi(id: string, status: Application['status']): Promise<Application> {
  return apiPatch(`/api/applications/${id}/status`, { status });
}

export async function deleteApplicationApi(id: string): Promise<void> {
  await apiDelete(`/api/applications/${id}`);
}

// ---------------- JD Matching ----------------
export async function analyzeJobMatch(jdText: string, resumeId: string): Promise<{
  score: number;
  inResume: string[];
  missingFromJD: string[];
}> {
  return apiPost('/api/match', { jdText, resumeId });
}

// ---------------- Gap Analysis ----------------
export async function getGapAnalysis(resumeId: string, targetRole?: string): Promise<TargetRoleGap> {
  return apiPost('/api/gap-analysis', { resumeId, targetRole });
}

// ---------------- Mock Interview ----------------
export async function getInterviewQA(role: string, resumeId?: string): Promise<InterviewExchange[]> {
  const params = new URLSearchParams({ role });
  if (resumeId) params.set('resumeId', resumeId);
  return apiGet(`/api/interview/questions?${params.toString()}`);
}

export async function sendInterviewAnswer(questionId: string, answer: string): Promise<InterviewExchange['feedback']> {
  return apiPost('/api/interview/answer', { questionId, answer });
}

// ---------------- Content Generator ----------------
export async function generateContent(type: string, role: string, tone: string, resumeId?: string, jdText?: string): Promise<string> {
  const data = await apiPost('/api/content', { type, role, tone, resumeId, jdText });
  return data.body;
}

// ---------------- Salary Negotiation ----------------
export async function simulateNegotiation(message: string, currentOffer: number, startingOffer?: number): Promise<{
  responseText: string;
  counterOffer: number;
  sentiment: 'reluctant' | 'neutral' | 'favorable';
}> {
  return apiPost('/api/negotiate', { message, currentOffer, startingOffer });
}

// ---------------- Telegram ----------------
export async function getTelegramLink(): Promise<{ linkCode: string; botDeepLink: string; linked: boolean }> {
  return apiGet('/api/telegram/link');
}

// ---------------- Analytics ----------------
export async function getAnalyticsSummary() {
  return apiGet('/api/analytics/summary');
}
