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
    slug: "marketing-manager",
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time / Contract",
    description:
      "Own the full marketing funnel for Craefto and the products and clients we work with. You will build and run go-to-market strategies, paid and organic social campaigns, lead generation, and SEO across whatever we ship next. This is a high-ownership role for an operator who can blend creative campaign thinking with data-driven execution.",
    responsibilities: [
      "Develop and execute end-to-end marketing strategies for Craefto and each product or client project we take on",
      "Plan, launch, and optimize paid social campaigns across Meta, TikTok, LinkedIn, and Google",
      "Own lead generation: build funnels, landing pages, and email sequences that turn attention into qualified leads",
      "Drive SEO: keyword research, on-page optimization, content planning, and technical SEO in partnership with the dev team",
      "Manage organic social channels (Instagram, TikTok, LinkedIn) including content calendar and posting",
      "Write compelling copy for ads, social posts, landing pages, and email campaigns",
      "Analyze campaign performance, track KPIs, and optimize for conversion, acquisition, and cost per lead",
      "Coordinate with the design team to produce high-impact marketing assets",
    ],
    requirements: [
      "3+ years of experience in digital marketing, growth marketing, or performance marketing",
      "Proven track record of building and scaling marketing campaigns from scratch across multiple brands or products",
      "Hands-on experience running paid campaigns on Meta Ads, Google Ads, and TikTok Ads",
      "Working knowledge of SEO fundamentals and tools (Google Search Console, Ahrefs, Semrush, or similar)",
      "Experience with lead generation funnels, landing pages, and email marketing platforms",
      "Strong copywriting skills with the ability to write persuasively in both English and Mongolian",
      "Experience with analytics tools (Google Analytics, Mixpanel, or similar) and data-driven decision making",
      "Native or near-native fluency in Mongolian and English",
      "Self-starter mentality with the ability to operate independently in a remote environment",
    ],
    niceToHaves: [
      "Experience marketing SaaS, fintech, or consumer apps",
      "Familiarity with CRM and marketing automation tools (HubSpot, Mailchimp, or similar)",
      "Experience with conversion rate optimization and A/B testing",
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
