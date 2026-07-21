import { UserProfile, ResumeVersion, Application, ScoreTrend, TargetRoleGap, InterviewExchange, GeneratedContent } from '../types';

export const mockUserProfile: UserProfile = {
  name: "Gopal Rao",
  email: "gopalrao18191@gmail.com",
  avatarUrl: ""
};

export const mockResumes: ResumeVersion[] = [
  {
    id: "frontend-dev",
    role: "Senior Frontend Developer",
    score: 87,
    updatedAt: "2026-07-10",
    summary: "Performance-driven Senior Frontend Developer with 6+ years of expertise in building responsive single-page applications. Highly skilled in TypeScript, React, Next.js, and browser performance optimization.",
    experience: [
      {
        company: "Stellar Labs",
        role: "Lead Frontend Engineer",
        period: "2024 - Present",
        bullets: [
          " Spearheaded rewrite of the core SaaS platform into Next.js App Router, resulting in a 42% decrease in Largest Contentful Paint (LCP) and 30% speedup in build times.",
          " Established modern design systems and compiled reusable TypeScript component libraries used across 5 distinct engineering units.",
          " Initiated robust client-side storage layers, reducing initial API load latency by 650ms for repeat users."
        ]
      },
      {
        company: "Synthetix Systems",
        role: "Senior React Engineer",
        period: "2021 - 2024",
        bullets: [
          " Engineered custom real-time financial dashboard displaying 10,000+ transaction points per second with no UI freezing.",
          " Championed web accessibility standards compliance, upgrading overall application score from WCAG fail to perfect AA compliance."
        ]
      }
    ],
    education: [
      {
        institution: "State Institute of Technology",
        degree: "B.S. in Computer Science",
        period: "2016 - 2020"
      }
    ],
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vite", "Zustand", "Webpack", "Accessibility", "Jest", "CI/CD"]
  },
  {
    id: "ai-engineer",
    role: "AI/ML Solutions Architect",
    score: 91,
    updatedAt: "2026-07-14",
    summary: "Machine Learning Solutions Architect focused on implementing server-side generative AI agents, fine-tuning large language models, and scaling real-time intelligent API integrations.",
    experience: [
      {
        company: "NeuralCraft Studio",
        role: "AI Engineer",
        period: "2024 - Present",
        bullets: [
          " Designed and deployed generative agent orchestration framework handling 120,000 requests/day, backed by Gemini models.",
          " Fine-tuned model prompts and contextual embeddings to decrease toxic outputs by 99.4% and hallucination rate by 15%."
        ]
      },
      {
        company: "Prism Intelligence",
        role: "Data Scientist",
        period: "2021 - 2024",
        bullets: [
          " Engineered a automated data extraction pipeline which reduced document classification times from 4 hours to 8 seconds.",
          " Built and evaluated regression systems for user retention, resulting in a 12% drop in quarterly churn."
        ]
      }
    ],
    education: [
      {
        institution: "Federal Tech University",
        degree: "M.S. in Machine Learning",
        period: "2019 - 2021"
      }
    ],
    skills: ["Python", "PyTorch", "TensorFlow", "Gemini API", "Embeddings", "FastAPI", "Vector DBs", "LangChain", "SQL", "Docker"]
  },
  {
    id: "prod-manager",
    role: "Technical Product Manager",
    score: 82,
    updatedAt: "2026-07-08",
    summary: "Product leader bridging the gap between deep systems engineering and beautiful user experiences. Adept at roadmap execution, telemetry analysis, and managing high-performing agile squads.",
    experience: [
      {
        company: "Inertia Software",
        role: "Technical Product Manager",
        period: "2023 - Present",
        bullets: [
          " Launched a developer API suite that reached $1.2M ARR in 9 months with 99.99% availability SLAs.",
          " Managed product roadmaps and daily sprint sequences for an agile team of 14 senior engineers and 2 UX designers."
        ]
      }
    ],
    education: [
      {
        institution: "Metropolitan Business School",
        degree: "M.B.A. in Technology Strategy",
        period: "2021 - 2023"
      }
    ],
    skills: ["Product Roadmap", "SQL Analytics", "Agile/Scrum", "A/B Testing", "API Design", "User Research", "Figma", "Jira", "Mixpanel"]
  }
];

export const mockApplications: Application[] = [
  {
    id: "app-1",
    company: "Linear Technologies",
    role: "Senior UI Architect",
    appliedDate: "2026-06-15",
    status: "Offer",
    resumeTag: "Senior Frontend Developer",
    salary: "$165,000",
    notes: "Offer received! Need to negotiate signing bonus."
  },
  {
    id: "app-2",
    company: "OpenAI Corp",
    role: "Agent Orchestration Lead",
    appliedDate: "2026-07-02",
    status: "Interview",
    resumeTag: "AI/ML Solutions Architect",
    salary: "$195,000",
    notes: "Round 3 technical mock interview scheduled for Friday."
  },
  {
    id: "app-3",
    company: "Vercel Inc",
    role: "DX Engineer (Frameworks)",
    appliedDate: "2026-07-05",
    status: "Interview",
    resumeTag: "Senior Frontend Developer",
    salary: "$150,000",
    notes: "Introductory chat went extremely well. Take-home exam submitted."
  },
  {
    id: "app-4",
    company: "Stripe",
    role: "Technical Integrations Lead",
    appliedDate: "2026-07-01",
    status: "Applied",
    resumeTag: "Technical Product Manager",
    salary: "$170,000",
    notes: "Referred by Principal Architect. Awaiting recruiter outreach."
  },
  {
    id: "app-5",
    company: "Koto Agency",
    role: "Creative Technologist",
    appliedDate: "2026-06-20",
    status: "Rejected",
    resumeTag: "Senior Frontend Developer",
    salary: "$140,000",
    notes: "Position closed. They decided to hire a designer who writes CSS instead."
  }
];

export const mockScoreTrends: ScoreTrend[] = [
  { week: "W1", resumeScore: 72, readinessScore: 60 },
  { week: "W2", resumeScore: 72, readinessScore: 62 },
  { week: "W3", resumeScore: 78, readinessScore: 65 },
  { week: "W4", resumeScore: 80, readinessScore: 70 },
  { week: "W5", resumeScore: 80, readinessScore: 72 },
  { week: "W6", resumeScore: 85, readinessScore: 78 },
  { week: "W7", resumeScore: 87, readinessScore: 82 },
  { week: "W8", resumeScore: 87, readinessScore: 85 }
];

export const mockRoleGaps: Record<string, TargetRoleGap> = {
  "frontend-dev": {
    role: "Senior Frontend Developer",
    skills: [
      { name: "TypeScript", current: 85, target: 95 },
      { name: "React 19 Hooks", current: 70, target: 90 },
      { name: "Webpack/Vite", current: 80, target: 85 },
      { name: "Browser Performance", current: 60, target: 90 },
      { name: "WCAG Accessibility", current: 50, target: 85 },
      { name: "State Orchestration", current: 75, target: 90 }
    ],
    milestones: [
      {
        title: "Q1: Advance Core Accessibility Mastery",
        timeframe: "Weeks 1-4",
        description: "Focus on keyboard traps, ARIA roles, and screen-reader compatibility matrix. Re-audit previous portfolios.",
        resources: [
          { name: "W3C Web Accessibility Guidelines (WCAG 2.2)", url: "https://www.w3.org/WAI/standards-guidelines/wcag/" },
          { name: "WebAIM Accessibility Checklist", url: "https://webaim.org/standards/wcag/checklist" }
        ]
      },
      {
        title: "Q2: Client-side Engine Optimizations",
        timeframe: "Weeks 5-8",
        description: "Study memory leaks in active listeners, optimize heavy animations via requestAnimationFrame, and benchmark React 19's Server Actions.",
        resources: [
          { name: "Google Chrome DevTools Core Audits", url: "https://developer.chrome.com/docs/devtools/" },
          { name: "V8 Engine Performance Internals", url: "https://v8.dev/" }
        ]
      }
    ]
  },
  "ai-engineer": {
    role: "AI/ML Solutions Architect",
    skills: [
      { name: "Python Orchestration", current: 90, target: 95 },
      { name: "Vector Database Design", current: 65, target: 90 },
      { name: "Prompt Hardening", current: 80, target: 95 },
      { name: "LLM Fine-tuning", current: 45, target: 80 },
      { name: "FastAPI / Docker", current: 85, target: 90 },
      { name: "Cost/Latency Management", current: 55, target: 85 }
    ],
    milestones: [
      {
        title: "Q1: Deploy Production-ready Vector Infrastructures",
        timeframe: "Weeks 1-5",
        description: "Establish semantic indexing models and write custom chunking criteria. Evaluate pgvector vs specialized clouds.",
        resources: [
          { name: "Vector Indexing Core Mathematics", url: "https://arxiv.org/" },
          { name: "Pinecone / Qdrant Production Benchmarks", url: "https://qdrant.tech/" }
        ]
      },
      {
        title: "Q2: Advanced Agent Guardrails & Fine-Tuning",
        timeframe: "Weeks 6-10",
        description: "Set up real-time filter networks to classify toxic outputs. Create automated datasets to tune lightweight open weights.",
        resources: [
          { name: "LlamaGuard Orchestration Guides", url: "https://huggingface.co/" }
        ]
      }
    ]
  },
  "prod-manager": {
    role: "Technical Product Manager",
    skills: [
      { name: "Product Roadmap Planning", current: 90, target: 95 },
      { name: "SQL Analytics & Telemetry", current: 75, target: 90 },
      { name: "API Architecture Design", current: 60, target: 85 },
      { name: "A/B Testing Rigor", current: 65, target: 85 },
      { name: "User Interview Analysis", current: 80, target: 90 }
    ],
    milestones: [
      {
        title: "Q1: Master Telemetry Engines & SQL Analytics",
        timeframe: "Weeks 1-4",
        description: "Write raw window queries to audit cohorts. Transition from vanity analytics to actual usage retention indexes.",
        resources: [
          { name: "Mixpanel Cohort Masterclass", url: "https://mixpanel.com/" },
          { name: "Advanced SQL window query patterns", url: "https://postgresqltutorial.com/" }
        ]
      }
    ]
  }
};

export const mockInterviewQAs: InterviewExchange[] = [
  {
    id: "q-1",
    role: "Senior Frontend Developer",
    question: "Can you walk us through how you optimized a poorly performing page in React?",
    sampleAnswer: "I identified a sluggish dashboard rendering 500+ list elements which caused page freezes. By leveraging react-window for list virtualization, caching heavy calculations inside useMemo, and tracking re-render triggers via Profiler, I reduced render cycles from 18 to 2 and boosted FPS to a constant 60.",
    feedback: {
      score: 88,
      strengths: ["Strong technical terminology (virtualization, profiling, render cycle calculation).", "Quantifiable success outcomes (FPS boost, cycles reduction)."],
      gaps: ["Didn't fully elaborate on how network payloads or state updates played a role before components rendered."],
      betterWording: "Include: 'To complement this, I debounced the search bar component inputs to prevent unnecessary server-side network requests, ensuring the react state stayed calm during rapid user typing.'"
    }
  },
  {
    id: "q-2",
    role: "Senior Frontend Developer",
    question: "How do you handle accessibility (WCAG AA compliance) when constructing highly interactive charts?",
    sampleAnswer: "I ensure charts have accessible HTML table fallback descriptions, set aria-hidden on structural SVGs, support full tab navigation with clear focus states for interactive bars, and provide high-contrast color choices that meet WCAG AA requirements.",
    feedback: {
      score: 92,
      strengths: ["Comprehensive coverage of keyboard navigability and aria labeling.", "Included fallback tables for screen readers which is a major compliance win."],
      gaps: ["No mention of how speech synthesizers or announcements handle real-time hover value changes."],
      betterWording: "Add: 'For real-time tooltips, I route live announcements to an off-screen aria-live pool so screen reader users hear active metric values instantly as they hover.'"
    }
  },
  {
    id: "q-3",
    role: "AI/ML Solutions Architect",
    question: "How do you control latency and expenses when calling large models in a high-traffic production application?",
    sampleAnswer: "I implement an aggressive server-side Redis caching system for common prompts, use semantic vector lookup to detect near-identical questions before asking the LLM, and stream the response to the user so perceived speed feels instant.",
    feedback: {
      score: 90,
      strengths: ["Highly practical focus on cache and semantic indexing.", "Leveraged modern streaming patterns to boost perceived performance."],
      gaps: ["Could dive deeper into model fallback strategies (e.g. cascading from ultra-fast Flash models to deep reasoning models)."],
      betterWording: "Say: 'I utilize a tier-based cascade system: standard tasks are handled by lightweight Gemini Flash instances, falling back to Gemini Pro only when deep reasoning or validation is required, saving up to 80% on token fees.'"
    }
  }
];

export const mockGeneratedLetters: GeneratedContent[] = [
  {
    id: "letter-1",
    role: "Senior Frontend Developer",
    type: "cover-letter",
    tone: "Confident",
    body: "Dear Hiring Team,\n\nI have spent the last six years engineering bulletproof frontend architectures that bridge high-frequency computing with flawless, minimal user interfaces. When I saw the opening for the Senior UI position, I knew my specific obsession with rendering performance and browser telemetry aligns perfectly with your agency's design goals.\n\nAt Stellar Labs, I guided our core engineering squad through a full system rewrite, stripping out heavy legacy bundles in favor of lightweight, type-safe React 19 components. The resulting 42% spike in Largest Contentful Paint didn't just look great on paper—it actively reduced customer drop-off by 14%.\n\nI build systems that work under pressure. I look forward to bringing that same disciplined aesthetic and technical rigor to your core platforms.\n\nBest,\nGopal Rao"
  },
  {
    id: "linkedin-1",
    role: "Senior Frontend Developer",
    type: "linkedin-about",
    tone: "Formal",
    body: "Lead Frontend Engineer specializing in high-performance React architectures, type-safe state systems, and compliant web interfaces. Dedicated to the craft of micro-interactions, responsive design structures, and rigorous browser performance benchmarks.\n\nCurrently spearheading modular component engineering at Stellar Labs. Always seeking to eliminate unnecessary browser execution frames and visual latency."
  },
  {
    id: "outreach-1",
    role: "AI/ML Solutions Architect",
    type: "cold-outreach",
    tone: "Warm",
    body: "Hi Elena,\n\nI’ve been following NeuralCraft’s development of server-side agents, particularly your recent publication on prompt context engineering. It’s a beautifully clean approach to a notoriously chaotic problem.\n\nI’m an AI Solutions Architect currently specializing in fine-tuning embeddings and context security layers. I’ve recently designed an orchestration setup that handles over 120,000 real-time queries daily. I would love to buy you a virtual coffee sometime next week to chat about model cascades and vector index efficiency.\n\nThanks,\nGopal"
  }
];
