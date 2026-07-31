import type { ProductConfig } from "./types.ts";

export const product: ProductConfig = {
  slug: "examplan",
  name: "ExamPlan",
  tagline: "How many hours per subject, and when to start",
  oneLiner:
    "Enter your exam date, subjects with syllabus size and difficulty, and available study hours to get a day-by-day study calendar with weighted allocation, revision blocks, and insufficiency warnings.",
  category: "Education tools",
  audience: "Students (board exams, competitive exams, university), parents, tutors, coaching centres",
  accent: "#134e4a",
  accentSoft: "#ecfeff",

  metrics: [
    { value: "30%", label: "Time reserved for revision" },
    { value: "3", label: "Subjects per day (variety)" },
    { value: "100%", label: "Syllabus coverage target" },
  ],

  problem: [
    {
      title: "Students study what they feel like, not what the math requires",
      body:
        "Physics has 15 chapters rated difficulty 5, but gets the same time as English with 8 chapters rated 2. Without weighted allocation, the hard subjects get crammed in the last week.",
    },
    {
      title: "Nobody allocates enough time for revision",
      body:
        "First-pass studying without revision has 20-30% retention at exam time. Research shows 2-3 revision passes are needed. But students finish the syllabus on day N-1 and have zero revision days.",
    },
    {
      title: "Starting too late is invisible until it is too late",
      body:
        "If you have 60 days and need 300 hours, that is 5 hours/day with zero buffer. At 3 available hours/day, you are 120 hours short. The calculator shows this on day 1, not day 50.",
    },
  ],

  features: [
    {
      title: "Weighted hour allocation per subject",
      body:
        "Hours allocated proportional to (syllabus_size x difficulty_rating). A 15-chapter subject at difficulty 5 gets 7.5x the weight of a 5-chapter subject at difficulty 1.",
    },
    {
      title: "Day-by-day study calendar",
      body:
        "Distributes subjects across days to avoid monotony (no more than 2 consecutive hours of one subject). Rotates subjects so you touch each one every 2-3 days.",
    },
    {
      title: "Revision blocks (30% of total time)",
      body:
        "Last 30% of available days reserved purely for revision. Revision allocation also weighted by difficulty. This is non-negotiable for retention.",
    },
    {
      title: "Insufficiency warning",
      body:
        "If total available hours are less than required, shows exactly how many additional hours per day would fix it. Makes the trade-off visible: either add hours or cut syllabus.",
    },
    {
      title: "Critical subjects identification",
      body:
        "Highlights subjects with highest (difficulty x syllabus_size / time_allocated) ratio. These are your risk subjects where any delay disproportionately hurts.",
    },
  ],

  how: [
    "Enter exam date, list subjects with chapter count and difficulty (1-5), and your available study hours per day.",
    "ExamPlan allocates hours per subject weighted by difficulty and size, creates a daily schedule, and reserves revision time.",
    "Get a printable day-by-day calendar with subjects, hours, and warnings if time is insufficient.",
  ],

  integrations: ["FlowForge", "Print/PDF", "Study planning apps"],

  pricing: [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      blurb: "For any student planning exam preparation.",
      features: ["Weighted allocation", "Daily calendar", "Revision blocks", "Insufficiency warning", "Critical subject ID"],
      cta: "Plan my study",
      monthlyRuns: 50,
      apiAccess: false,
      rateLimitPerMin: 10,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/mo",
      blurb: "For tutors and coaching centres.",
      features: [
        "REST API + MCP server access",
        "Multi-student plans",
        "Progress tracking integration",
        "Custom templates",
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
      blurb: "For edtech platforms and school systems.",
      features: [
        "Volume pricing",
        "Self-hosted Docker image",
        "LMS integration",
        "SSO and audit log",
        "White-label embedding",
      ],
      cta: "Talk to us",
      monthlyRuns: Number.POSITIVE_INFINITY,
      apiAccess: true,
      rateLimitPerMin: 600,
    },
  ],

  faq: [
    {
      q: "Why 30% for revision?",
      a: "Research on spaced repetition shows that without revision, you retain only 20-30% after a week. Two revision passes bring retention to 70-80%. The 30% allocation provides time for 2 full revision cycles of the entire syllabus, weighted by difficulty.",
    },
    {
      q: "What if I cannot study the recommended hours?",
      a: "The tool shows the gap explicitly. If you need 5 hours/day but can only do 3, it shows you are 40% short and what to cut. Options: extend study period (start earlier), increase daily hours, or prioritise high-weight subjects and accept lower coverage of easy ones.",
    },
    {
      q: "How does it handle different chapter sizes?",
      a: "Each subject's weight = chapters x difficulty. If one chapter is known to be huge (like Organic Chemistry), count it as 2-3 chapters when inputting. The tool trusts your count and allocates proportionally.",
    },
    {
      q: "Does it work for competitive exams like JEE/NEET?",
      a: "Yes. Enter Physics, Chemistry, Maths (JEE) or Physics, Chemistry, Biology (NEET) with their chapter counts and your difficulty rating. The allocation respects that PCM/PCB need very different time investments based on your strengths.",
    },
    {
      q: "What about subjects I have already partially completed?",
      a: "Reduce the chapter count for that subject to reflect only remaining chapters. If you have finished 10 of 15 Physics chapters, enter 5. The tool plans for what is left, not what you started with.",
    },
  ],

  inputs: [
    {
      name: "examDate",
      label: "Exam date",
      type: "text",
      required: true,
      placeholder: "2025-03-15",
      help: "Date of first exam paper. Study plan works backwards from this date.",
    },
    {
      name: "subjects",
      label: "Subjects (name,chapters,difficulty per line)",
      type: "textarea",
      required: true,
      placeholder: "Physics,15,5\nChemistry,12,4\nMathematics,13,5\nEnglish,8,2\nComputer Science,10,3",
      help: "One subject per line: name,number_of_chapters,difficulty(1-5). Difficulty 5 = hardest for you.",
      rows: 5,
    },
    {
      name: "hoursPerDay",
      label: "Available study hours per day",
      type: "text",
      required: true,
      placeholder: "6",
      help: "Realistic hours you can study effectively per day. Be honest: 6-8 is sustainable, 10+ rarely works.",
    },
    {
      name: "daysAvailable",
      label: "Days available (or leave blank to auto-calculate)",
      type: "text",
      required: false,
      placeholder: "",
      help: "Override if you want to specify days directly instead of calculating from exam date.",
    },
  ],

  sample: {
    examDate: "2025-03-15",
    subjects: "Physics,15,5\nChemistry,12,4\nMathematics,13,5\nEnglish,8,2\nComputer Science,10,3",
    hoursPerDay: "6",
    daysAvailable: "",
  },

  mcpTool: {
    name: "exam_study_planner",
    description:
      "Create a weighted study plan for exam preparation. Allocates hours per subject based on syllabus size and difficulty, generates day-by-day calendar with revision blocks, and warns if total time is insufficient.",
  },
};
