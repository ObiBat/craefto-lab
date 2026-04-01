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
];

export function getRoleBySlug(slug: string): Role | undefined {
  return roles.find((role) => role.slug === slug);
}

export function getAllRoleSlugs(): string[] {
  return roles.map((role) => role.slug);
}
