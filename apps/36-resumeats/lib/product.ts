import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "resumeats",
  name: "ResumeATS",
  tagline: "What an ATS actually sees in your resume",
  oneLiner:
    "Paste your resume and a target job description to see exactly how an ATS parses, scores, and filters your application - with keyword match rates, section detection, and gap analysis.",
  category: "Career tools",
  audience: "Job seekers in India and globally, career coaches, resume writers, placement consultants",
  accent: "#dc2626",
  accentSoft: "#fef2f2",

  metrics: [
    { value: "8", label: "ATS criteria scored" },
    { value: "75%+", label: "Match rate needed to pass" },
    { value: "6", label: "Common rejection flags caught" },
  ],

  problem: [
    {
      title: "You never see what the ATS sees",
      body:
        "You submit a polished resume. The ATS strips formatting, misreads sections, drops bullet points, and sends a garbled text blob to the recruiter. You never know what got lost.",
    },
    {
      title: "Keyword matching is invisible",
      body:
        "Most ATS systems rank candidates by keyword overlap with the job description. If you use 'managed' but the JD says 'led', your match rate drops. Nobody tells you which words matter.",
    },
    {
      title: "Rejection happens before a human reads it",
      body:
        "70% of resumes are rejected by ATS before a recruiter sees them. Missing contact info, undated experience, or the wrong section order can disqualify you silently.",
    },
  ],

  features: [
    {
      title: "ATS-parsed view",
      body:
        "See exactly what text an ATS extracts from your resume: which sections it identifies, what it skips, and how it structures your experience for keyword matching.",
    },
    {
      title: "Keyword match rate",
      body:
        "Compares your resume against job description keywords and shows the overlap percentage, missing keywords, and which of your words are irrelevant filler.",
    },
    {
      title: "Section presence and order check",
      body:
        "Verifies all expected sections exist (contact, summary, experience, education, skills) and flags non-standard ordering that confuses parsers.",
    },
    {
      title: "Quantified achievements count",
      body:
        "Counts bullet points with numbers, percentages, or metrics. ATS-friendly resumes have 60%+ quantified bullets. Flags vague statements.",
    },
    {
      title: "Employment gap detection",
      body:
        "Identifies gaps between roles and flags them. Also catches undated positions that ATS systems either skip or misattribute.",
    },
    {
      title: "Action verb and buzzword analysis",
      body:
        "Scores your verb usage (led, built, increased) vs weak verbs (responsible for, helped with) and flags buzzwords without supporting evidence.",
    },
  ],

  how: [
    "Paste your resume text and the target job description keywords or full JD.",
    "ResumeATS parses sections, scores keyword match rate, checks formatting, counts achievements, and flags rejection risks.",
    "Get the ATS-parsed version showing exactly what gets extracted, what gets lost, and a prioritised fix list.",
  ],

  integrations: ["FlowForge", "Google Docs", "LinkedIn export"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For job seekers who want to know what the ATS sees.",
      features: ["Full ATS parse", "Keyword match rate", "Section checks", "Gap detection", "Fix suggestions"],
      cta: "Scan my resume",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Coach",
      price: "$19",
      period: "/mo",
      blurb: "For career coaches and resume writers serving multiple clients.",
      features: [
        "REST API + MCP server access",
        "Bulk resume scanning",
        "Client-branded reports",
        "Role-specific scoring",
        "Priority support",
      ],
      cta: "Start 14-day trial",
      highlight: true,
      monthlyRuns: 5_000,
      apiAccess: true,
      rateLimitPerMin: 120,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "/mo",
      blurb: "For placement agencies and HR platforms processing thousands of resumes.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "ATS integration webhooks",
        "SSO and audit log",
        "Custom scoring rules",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "How accurate is this compared to a real ATS?",
      a: "This replicates the text-extraction and keyword-matching logic used by most ATS systems (Taleo, Greenhouse, Lever, Workday). The parsing rules are based on published documentation and reverse-engineering of how these systems handle section headers, date formats, and keyword weighting.",
    },
    {
      q: "Does it store my resume?",
      a: "No. The resume text is processed in memory and discarded. Nothing is saved to disk or database. The engine is stateless by design.",
    },
    {
      q: "What keyword match rate do I need?",
      a: "Most ATS systems shortlist candidates with 75%+ keyword overlap. Below 50% you are almost certainly filtered out. Between 50-75% depends on the applicant pool size.",
    },
    {
      q: "Should I stuff keywords to get a higher score?",
      a: "No. Modern ATS systems (and recruiters) detect keyword stuffing. The goal is natural integration of relevant terms from the JD into your experience descriptions. Use the exact phrases from the job posting where they genuinely apply.",
    },
    {
      q: "Does formatting matter if I paste plain text?",
      a: "Yes. Section headers, date formats, and bullet structure still matter in plain text. An ATS that receives your PDF converts it to text first, then parses that text. What you see here is what it sees.",
    },
  ],

  inputs: [
    {
      name: "resume",
      label: "Resume text",
      type: "textarea",
      required: true,
      placeholder: "Paste your full resume text here...",
      help: "Copy-paste from your resume document. Plain text works best to simulate what an ATS actually receives.",
      rows: 12,
    },
    {
      name: "jobDescription",
      label: "Job description or target keywords",
      type: "textarea",
      required: true,
      placeholder: "Paste the job description or list key skills/requirements...",
      help: "The full JD works best. Or list the key skills and requirements separated by commas.",
      rows: 8,
    },
    {
      name: "targetRole",
      label: "Target role title",
      type: "text",
      required: false,
      placeholder: "Senior Software Engineer",
      help: "Optional. Helps score role-title alignment.",
    },
  ],

  sample: {
    resume: `Rajesh Kumar
Email: rajesh.kumar@gmail.com | Phone: +91 98765 43210 | LinkedIn: linkedin.com/in/rajeshkumar
Mumbai, Maharashtra

PROFESSIONAL SUMMARY
Senior Software Engineer with 7 years of experience in full-stack development. Expertise in React, Node.js, and cloud architecture. Led teams of 5-8 engineers to deliver products serving 2M+ users.

EXPERIENCE

Senior Software Engineer | Flipkart | Jan 2021 - Present
- Led migration of monolithic architecture to microservices, reducing deployment time by 60%
- Built real-time inventory management system handling 50,000 transactions/minute
- Mentored 5 junior developers, 3 promoted within 18 months
- Reduced API response time from 800ms to 120ms through caching strategy

Software Engineer | Infosys | Mar 2018 - Dec 2020
- Developed customer-facing dashboard used by 500+ enterprise clients
- Implemented CI/CD pipeline reducing release cycles from 2 weeks to 2 days
- Wrote unit tests achieving 85% code coverage across 3 microservices
- Responsible for handling client escalations and support tickets

Junior Developer | TCS | Jun 2016 - Feb 2018
- Helped with frontend development using Angular
- Was part of the team that built the reporting module
- Attended daily standups and contributed to sprint planning

EDUCATION
B.Tech Computer Science | IIT Bombay | 2012 - 2016 | CGPA: 8.4/10

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Redis, GraphQL, REST APIs, Microservices, System Design

CERTIFICATIONS
AWS Solutions Architect Associate (2022)
Google Cloud Professional Developer (2023)`,
    jobDescription: `Senior Software Engineer - Backend

We are looking for a Senior Software Engineer to join our platform team. You will design and build scalable backend services handling millions of requests daily.

Requirements:
- 5+ years of experience in backend development
- Strong proficiency in Java or Go (Python/Node.js acceptable)
- Experience with distributed systems and microservices architecture
- Hands-on experience with Kafka, RabbitMQ, or similar message queues
- Proficiency in SQL and NoSQL databases
- Experience with containerization (Docker, Kubernetes)
- Strong understanding of system design and scalability patterns
- Experience with CI/CD pipelines and DevOps practices

Nice to have:
- Experience with event-driven architecture
- Knowledge of observability tools (Datadog, Grafana, Prometheus)
- Contribution to open source projects
- Experience leading a team of 3+ engineers

Responsibilities:
- Design and implement high-throughput backend services
- Lead technical design discussions and code reviews
- Mentor junior engineers and drive engineering best practices
- Collaborate with product and data teams on feature development
- Own service reliability with on-call rotation`,
    targetRole: "Senior Software Engineer - Backend",
  },

  mcpTool: {
    name: "resume_ats_scan",
    description:
      "Parse a resume against ATS criteria, score keyword match rate against a job description, detect sections, flag missing info, count quantified achievements, and show exactly what an ATS extracts vs what gets lost.",
  },
};
