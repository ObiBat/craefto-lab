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
  },
  {
    slug: "bilingual-writer",
    title: "Bilingual Writer (Mongolian / English)",
    department: "Content",
    location: "Remote",
    type: "Contract",
    description:
      "Write compelling editorial content, articles, and copy in both Mongolian and English. You will shape how brands sound across cultures, producing work that reads naturally in both languages. This role is for someone who thinks in two languages and writes with precision in each.",
    responsibilities: [
      "Write and edit long form articles, case studies, and editorial pieces in Mongolian and English",
      "Craft brand copy, taglines, and messaging frameworks for client projects",
      "Produce website copy, landing pages, and product descriptions that convert",
      "Adapt and localize content between Mongolian and English while preserving tone and intent",
      "Write social media copy and captions tailored to each platform",
      "Collaborate with designers and strategists to align copy with visual direction",
      "Research topics thoroughly and produce factually accurate, well sourced content",
    ],
    requirements: [
      "Native or near native fluency in both Mongolian and English (written and spoken)",
      "2+ years of professional writing experience (editorial, copywriting, or content)",
      "Strong portfolio demonstrating published work in both languages",
      "Excellent grammar, tone control, and ability to match different brand voices",
      "Experience writing for digital platforms (web, social media, email)",
      "Ability to meet deadlines and manage multiple writing projects simultaneously",
      "Eye for detail and commitment to accuracy in every piece",
    ],
    niceToHaves: [
      "Experience in journalism, magazine writing, or editorial publishing",
      "Background in SEO writing and content strategy",
      "Familiarity with the Mongolian community in Australia",
      "Experience writing for tech, design, or creative industry brands",
      "Basic understanding of content management systems (WordPress, Notion, similar)",
    ],
    postedDate: "2026-04-01",
  },
];

export function getRoleBySlug(slug: string): Role | undefined {
  return roles.find((role) => role.slug === slug);
}

export function getAllRoleSlugs(): string[] {
  return roles.map((role) => role.slug);
}
