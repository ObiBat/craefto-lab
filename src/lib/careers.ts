export type ApplicationQuestionType =
  | "single-select"
  | "multi-select"
  | "short-text"
  | "long-text"
  | "number"
  | "compensation";

export interface ApplicationQuestion {
  id: string;
  label: string;
  helperText?: string;
  type: ApplicationQuestionType;
  required: boolean;
  options?: string[];
  minLength?: number;
  maxLength?: number;
  placeholder?: string;
}

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
  questions: ApplicationQuestion[];
}

export const roles: Role[] = [
  {
    slug: "creative-designer",
    title: "Creative Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time / Contract",
    description:
      "Shape the visual identity of every project we touch. From brand systems to marketing assets, social content to presentation decks, you will craft visuals that feel intentional, modern, and unmistakably polished. This is a hands on creative role for someone who lives and breathes visual design.",
    responsibilities: [
      "Design brand identities, logos, and visual systems for client projects",
      "Create marketing collateral: social media graphics, carousel posts, pitch decks, and digital ads",
      "Develop visual concepts and mood boards that set creative direction",
      "Design layouts for web pages, landing pages, and email campaigns",
      "Produce print ready and digital ready assets across multiple formats",
      "Maintain visual consistency across all touchpoints for each brand",
      "Collaborate with the team to bring creative ideas from concept to finished output",
    ],
    requirements: [
      "2+ years of professional graphic design or visual design experience",
      "Expert proficiency in Figma, Adobe Creative Suite (Illustrator, Photoshop, InDesign)",
      "Strong portfolio showcasing brand identity, typography, layout, and visual storytelling",
      "Sharp eye for typography, color theory, composition, and spacing",
      "Experience creating assets for social media platforms (Instagram, LinkedIn, X)",
      "Ability to work across multiple projects and maintain quality under deadlines",
      "Understanding of print production and digital asset specifications",
    ],
    niceToHaves: [
      "Motion graphics or animation skills (After Effects, Rive, Lottie)",
      "Experience with 3D tools (Blender, Spline) for visual explorations",
      "Photography or art direction background",
      "Familiarity with design systems and component thinking",
      "Experience in a studio, agency, or freelance environment",
    ],
    postedDate: "2026-04-01",
    questions: [
      {
        id: "experience_years",
        label: "Years of design experience",
        type: "single-select",
        required: true,
        options: ["Under 1", "1 to 2", "2 to 4", "4 to 7", "7 plus"],
      },
      {
        id: "commitment",
        label: "Engagement preference",
        type: "single-select",
        required: true,
        options: ["Full-time", "Part-time", "Contract", "Project-based", "Open to any"],
      },
      {
        id: "hours_per_week",
        label: "Hours per week you can commit",
        type: "single-select",
        required: true,
        options: ["Under 10", "10 to 20", "20 to 30", "30 to 40", "40 plus"],
      },
      {
        id: "availability",
        label: "Earliest start date",
        type: "single-select",
        required: true,
        options: ["Immediately", "Within 2 weeks", "Within a month", "1 to 2 months", "Flexible"],
      },
      {
        id: "compensation",
        label: "Pay expectation",
        helperText: "Enter the amount you are looking for and the rate basis",
        type: "compensation",
        required: true,
      },
      {
        id: "tools",
        label: "Tools you are proficient in",
        helperText: "Select all that apply",
        type: "multi-select",
        required: false,
        options: [
          "Figma",
          "Adobe Illustrator",
          "Adobe Photoshop",
          "Adobe InDesign",
          "After Effects",
          "Blender / Spline",
          "Webflow",
          "Framer",
        ],
      },
      {
        id: "why_craefto",
        label: "Why Craefto?",
        helperText: "Optional. A few sentences is plenty.",
        type: "long-text",
        required: false,
        maxLength: 500,
        placeholder: "What drew you to the studio?",
      },
    ],
  },
  {
    slug: "marketing-manager",
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time / Contract",
    description:
      "Own the entire marketing funnel for Craefto and our flagship product, GlobFam. You will build and execute go-to-market strategies, manage social channels, and drive user acquisition. This is a high-ownership role for an operator who can blend creative campaign thinking with data-driven execution.",
    responsibilities: [
      "Develop and execute the comprehensive marketing strategy for GlobFam's MVP launch",
      "Manage all social media channels (Instagram, TikTok, LinkedIn) including content calendar and posting",
      "Write compelling copy for ads, social posts, landing pages, and email campaigns",
      "Analyze campaign performance, track KPIs, and optimize for conversion and acquisition",
      "Coordinate with the design team to produce high-impact marketing assets",
      "Manage community engagement and build brand trust within the Mongolian diaspora in Australia",
      "Plan and execute local community events, sponsorships, and university orientations",
    ],
    requirements: [
      "3+ years of experience in digital marketing, growth marketing, or social media management",
      "Proven track record of building and scaling marketing campaigns from scratch",
      "Strong copywriting skills with the ability to write persuasively in both English and Mongolian",
      "Deep understanding of social media algorithms, trends, and content formats",
      "Experience with analytics tools (Google Analytics, Mixpanel, or similar) and data-driven decision making",
      "Native or near-native fluency in Mongolian and English",
      "Self-starter mentality with the ability to operate independently in a remote environment",
    ],
    niceToHaves: [
      "Experience marketing fintech, SaaS, or consumer apps",
      "Familiarity with the Mongolian international student community in Australia",
      "Experience with paid advertising (Meta Ads, Google Ads, TikTok Ads)",
      "Basic design or video editing skills for quick social execution",
      "Previous experience in a startup or fast-paced agency environment",
    ],
    postedDate: "2026-04-21",
    questions: [
      {
        id: "experience_years",
        label: "Years of marketing experience",
        type: "single-select",
        required: true,
        options: ["1 to 3", "3 to 5", "5 to 7", "7 plus"],
      },
      {
        id: "commitment",
        label: "Engagement preference",
        type: "single-select",
        required: true,
        options: ["Full-time", "Contract", "Open to either"],
      },
      {
        id: "availability",
        label: "Earliest start date",
        type: "single-select",
        required: true,
        options: ["Immediately", "Within 2 weeks", "Within a month", "Flexible"],
      },
      {
        id: "compensation",
        label: "Pay expectation",
        helperText: "Enter your expected rate or salary range",
        type: "compensation",
        required: true,
      },
      {
        id: "campaign_example",
        label: "Proudest Campaign",
        helperText: "Briefly describe a campaign you ran end-to-end and its results.",
        type: "long-text",
        required: true,
        maxLength: 800,
        placeholder: "What was the goal, what did you do, and what happened?",
      },
      {
        id: "why_craefto",
        label: "Why Craefto?",
        helperText: "Optional. A few sentences is plenty.",
        type: "long-text",
        required: false,
        maxLength: 500,
        placeholder: "Why do you want to lead marketing here?",
      },
    ],
  },
];

export function getRoleBySlug(slug: string): Role | undefined {
  return roles.find((role) => role.slug === slug);
}

export function getAllRoleSlugs(): string[] {
  return roles.map((role) => role.slug);
}
