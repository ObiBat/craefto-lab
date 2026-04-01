export interface Role {
  slug: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHaves: string[];
  postedDate: string;
}

export const roles: Role[] = [
  {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    description:
      "Build and maintain web applications using React, Next.js, and Node.js. Work directly with clients on projects that matter. You will own features end to end, from database schema to polished UI, shipping work you are genuinely proud of.",
    responsibilities: [
      "Architect and build full stack web applications with Next.js, React, and TypeScript",
      "Design and implement RESTful APIs and database schemas",
      "Collaborate with designers to translate Figma mockups into pixel perfect, responsive interfaces",
      "Write clean, tested, maintainable code with proper documentation",
      "Participate in code reviews and contribute to engineering standards",
      "Work directly with clients to understand requirements and propose technical solutions",
      "Optimize application performance, accessibility, and SEO",
    ],
    requirements: [
      "3+ years of professional experience with React and TypeScript",
      "Strong understanding of Next.js (App Router, Server Components, API routes)",
      "Experience with relational databases (PostgreSQL preferred) and ORMs",
      "Solid grasp of responsive design, CSS architecture, and Tailwind CSS",
      "Familiarity with version control (Git) and CI/CD workflows",
      "Ability to communicate clearly with both technical and non technical stakeholders",
      "Portfolio or GitHub profile demonstrating shipped projects",
    ],
    niceToHaves: [
      "Experience with Supabase, Vercel, or similar platforms",
      "Background in design systems and component libraries",
      "Interest in AI/ML integrations and automation",
      "Open source contributions or technical writing",
      "Experience working in a small team or agency environment",
    ],
    postedDate: "2026-03-28",
  },
  {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time / Contract",
    description:
      "Create beautiful, functional interfaces for web applications and brand systems. You will research, wireframe, prototype, and test designs that solve real problems for real people. Every pixel matters here.",
    responsibilities: [
      "Lead the design process from research and ideation through to high fidelity prototypes",
      "Create responsive UI designs in Figma with proper component architecture",
      "Conduct user research, usability testing, and competitive analysis",
      "Build and maintain design systems with reusable tokens, components, and patterns",
      "Collaborate closely with developers to ensure design intent is preserved in code",
      "Present design decisions to clients with clear rationale",
      "Stay current with design trends, tools, and accessibility standards",
    ],
    requirements: [
      "3+ years of professional UI/UX design experience",
      "Expert level proficiency in Figma (components, auto layout, variables, prototyping)",
      "Strong portfolio demonstrating both visual design and user centered thinking",
      "Understanding of responsive design principles and web technologies",
      "Experience building and documenting design systems",
      "Knowledge of WCAG accessibility guidelines",
      "Clear communication skills and ability to articulate design rationale",
    ],
    niceToHaves: [
      "Experience with motion design (Framer Motion, After Effects, Rive)",
      "Basic front end development skills (HTML, CSS, React)",
      "Background in brand identity and visual strategy",
      "Experience working with development teams in an agile environment",
      "Familiarity with analytics tools and data informed design decisions",
    ],
    postedDate: "2026-03-28",
  },
  {
    slug: "ai-automation-engineer",
    title: "AI & Automation Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Contract",
    description:
      "Build intelligent systems, LLM integrations, and automation workflows for clients and internal tools. You will work at the intersection of AI and practical software engineering, turning complex automation ideas into reliable, production ready systems.",
    responsibilities: [
      "Design and implement AI powered workflows using LLM APIs (OpenAI, Anthropic, Google)",
      "Build custom agents, RAG pipelines, and intelligent automation systems",
      "Integrate AI capabilities into existing web applications and business processes",
      "Develop internal tools that improve team productivity and client delivery",
      "Evaluate and recommend AI tools, models, and architectures for specific use cases",
      "Write documentation and guides for AI systems and their maintenance",
      "Monitor, test, and iterate on AI system performance and accuracy",
    ],
    requirements: [
      "2+ years of experience working with LLM APIs and AI/ML systems",
      "Strong Python and/or TypeScript skills",
      "Experience building production AI integrations (not just prototypes)",
      "Understanding of prompt engineering, fine tuning, and retrieval augmented generation",
      "Familiarity with vector databases and embedding models",
      "Ability to evaluate tradeoffs between different AI approaches",
      "Clear documentation and communication skills",
    ],
    niceToHaves: [
      "Experience with agent frameworks (LangChain, CrewAI, or custom)",
      "Background in process automation (n8n, Zapier, or similar)",
      "Knowledge of web scraping, data pipelines, and ETL processes",
      "Experience with cloud deployment (AWS, GCP, Vercel)",
      "Interest in building developer tools or internal platforms",
    ],
    postedDate: "2026-03-28",
  },
];

export function getRoleBySlug(slug: string): Role | undefined {
  return roles.find((role) => role.slug === slug);
}

export function getAllRoleSlugs(): string[] {
  return roles.map((role) => role.slug);
}
