"use client";

import Image from "next/image";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Separator } from "@/components/ui/separator";
import { SectionLabel } from "@/components/ui/section-label";
import { AnimatedSection, StaggeredGrid, StaggeredItem } from "@/components/ui/motion";

// ============================================================================
// STACK TOOLS
// ============================================================================

interface StackTool {
  name: string;
  icon: React.ReactNode;
}

const STACK_TOOLS: StackTool[] = [
  {
    name: "Next.js",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.572 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
      </svg>
    ),
  },
  {
    name: "React",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.31 0-.592.06-.842.174-.95.44-1.46 1.717-1.383 3.489.025.547.09 1.127.19 1.727-1.68.448-3.084 1.07-4.08 1.862C.324 9.244 0 9.947 0 10.72c0 1.554 1.544 3.1 4.028 4.139-.13.553-.205 1.088-.233 1.59-.083 1.782.424 3.064 1.378 3.507.254.117.54.176.842.176 1.347 0 3.108-.962 4.888-2.624 1.78 1.654 3.542 2.604 4.887 2.604.303 0 .588-.058.842-.174.953-.44 1.46-1.717 1.383-3.49-.026-.547-.09-1.127-.19-1.727 1.68-.449 3.084-1.071 4.08-1.862.696-.558 1.02-1.262 1.02-2.035 0-1.554-1.544-3.1-4.028-4.14.13-.552.205-1.087.233-1.59.083-1.78-.424-3.063-1.378-3.506a1.857 1.857 0 0 0-.842-.175zM6.68 3.205c.146 0 .27.025.38.075.467.216.73.98.665 2.105-.018.352-.065.738-.137 1.143a16.39 16.39 0 0 0-3.495.965C3.534 6.07 3.38 4.88 3.625 4.2c.165-.462.515-.736.975-.795.036-.005.073-.007.11-.007h-.03zm10.64 0c.036 0 .073.002.11.007.46.06.81.333.975.795.245.68.09 1.87-.466 3.293a16.39 16.39 0 0 0-3.495-.965 16.154 16.154 0 0 0-.137-1.143c-.065-1.125.198-1.89.665-2.105.11-.05.234-.075.38-.075h-.032zM12 5.464c.575.63 1.15 1.354 1.706 2.147a20.432 20.432 0 0 0-3.412 0A18.66 18.66 0 0 1 12 5.464zm13.08 7.72a14.584 14.584 0 0 1-1.09 3.433 18.222 18.222 0 0 0-1.544-2.06c.291-.628.551-1.244.784-1.84a15.28 15.28 0 0 1 1.85.467zM12 18.536a18.66 18.66 0 0 1-1.706-2.147 20.432 20.432 0 0 0 3.412 0A18.66 18.66 0 0 1 12 18.536z" />
      </svg>
    ),
  },
  {
    name: "TypeScript",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.42.276.69.394c.268.118.58.235.936.352.48.16.895.333 1.248.52.354.187.65.395.888.624.24.229.419.484.54.766.119.282.18.602.18.96 0 .464-.09.87-.27 1.217a2.41 2.41 0 0 1-.76.862c-.327.227-.72.398-1.178.513a6.04 6.04 0 0 1-1.537.187c-.658 0-1.252-.066-1.784-.197a4.986 4.986 0 0 1-1.29-.467v-2.6a4.79 4.79 0 0 0 .782.475c.285.145.575.263.867.354.294.09.584.154.87.19a5.2 5.2 0 0 0 .773.053c.293 0 .554-.025.784-.076.23-.05.423-.126.581-.226a1.07 1.07 0 0 0 .368-.374.99.99 0 0 0 .126-.508.848.848 0 0 0-.174-.544 1.834 1.834 0 0 0-.505-.439 5.156 5.156 0 0 0-.8-.396 25.6 25.6 0 0 0-1.063-.388c-.457-.157-.866-.34-1.226-.545a3.834 3.834 0 0 1-.883-.666 2.632 2.632 0 0 1-.53-.84 2.84 2.84 0 0 1-.177-1.034c0-.438.09-.833.272-1.186.18-.354.433-.657.757-.913a3.61 3.61 0 0 1 1.16-.611 4.9 4.9 0 0 1 1.49-.219zm-9.46.139h5.563v1.861H12.5v8.25H10.19v-8.25H8.028V9.889z" />
      </svg>
    ),
  },
  {
    name: "Tailwind",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
      </svg>
    ),
  },
  {
    name: "Vercel",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M12 1L1 22h22L12 1z" />
      </svg>
    ),
  },
  {
    name: "Figma",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.097-7.509a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019a3.023 3.023 0 0 0-3.019-3.019h-.098z" />
      </svg>
    ),
  },
  {
    name: "Supabase",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M21.362 9.354H12V.396a.396.396 0 0 0-.716-.233L2.203 12.424l-.401.562a1.04 1.04 0 0 0 .836 1.659H12v8.959a.396.396 0 0 0 .716.233l9.081-12.261.401-.562a1.04 1.04 0 0 0-.836-1.66z" />
      </svg>
    ),
  },
  {
    name: "OpenAI",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
  },
  {
    name: "Claude",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M4.709 15.955l4.71-2.72-4.71-2.72a.803.803 0 0 1 0-1.39l6.422-3.707a.803.803 0 0 1 .803 0l6.422 3.708a.803.803 0 0 1 0 1.39l-4.71 2.719 4.71 2.72a.803.803 0 0 1 0 1.39l-6.422 3.708a.803.803 0 0 1-.803 0l-6.422-3.709a.803.803 0 0 1 0-1.39z" />
      </svg>
    ),
  },
  {
    name: "Framer",
    icon: (
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    name: "Node.js",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M11.998 24c-.321 0-.641-.084-.922-.247l-2.936-1.737c-.438-.245-.224-.332-.08-.383.585-.203.703-.25 1.328-.604.065-.037.15-.023.218.017l2.256 1.339a.29.29 0 0 0 .272 0l8.795-5.076a.277.277 0 0 0 .134-.238V6.921a.28.28 0 0 0-.137-.242l-8.791-5.072a.278.278 0 0 0-.271 0L3.075 6.68a.284.284 0 0 0-.139.241v10.15a.27.27 0 0 0 .138.236l2.409 1.392c1.307.654 2.108-.116 2.108-.89V7.787c0-.142.114-.253.256-.253h1.115c.139 0 .255.112.255.253v10.021c0 1.745-.95 2.745-2.604 2.745-.508 0-.909 0-2.026-.55l-2.307-1.33A1.85 1.85 0 0 1 1.36 17.07V6.921c0-.645.346-1.248.916-1.569l8.795-5.082a1.926 1.926 0 0 1 1.855 0l8.794 5.082c.57.321.916.924.916 1.569v10.15c0 .645-.346 1.246-.916 1.568l-8.795 5.076a1.834 1.834 0 0 1-.927.247z" />
      </svg>
    ),
  },
];

function ToolLogo({ tool }: { tool: StackTool }) {
  return (
    <div
      className="flex items-center gap-2.5 px-5 md:px-7 opacity-50 hover:opacity-80 transition-opacity duration-300"
      aria-label={tool.name}
    >
      <span className="text-[hsl(var(--color-foreground))] shrink-0">
        {tool.icon}
      </span>
      <span className="text-sm font-medium tracking-tight text-[hsl(var(--color-foreground))] whitespace-nowrap">
        {tool.name}
      </span>
    </div>
  );
}

// ============================================================================
// DATA
// ============================================================================

interface TeamMember {
  name: string;
  role: string;
  detail: string;
  image?: string;
  featured?: boolean;
  socials: {
    linkedin?: string;
    twitter?: string;
    dribbble?: string;
  };
}

const TEAM: TeamMember[] = [
  {
    name: "Obi Batbileg",
    role: "Founder & Developer",
    detail: "Coffee snob. Pixel perfectionist.",
    image: "/team/obi.jpg",
    featured: true,
    socials: { linkedin: "https://www.linkedin.com/in/obi-batbileg/" },
  },
  {
    name: "Urna Ganbat",
    role: "Financial Accountant",
    detail: "Numbers driven. Detail oriented.",
    image: "/team/urna.jpg",
    socials: { linkedin: "https://www.linkedin.com/in/urna-ganbat/" },
  },
  {
    name: "Enkhbold Altangerel",
    role: "Security Engineer",
    detail: "Defense minded. Always vigilant.",
    image: "/team/enkhbold.jpg",
    socials: { linkedin: "https://www.linkedin.com/in/enkhbold-altangerel-a7227a1a2/" },
  },
  {
    name: "Sara Chinzorig",
    role: "Creative",
    detail: "Visual thinker. Always exploring.",
    socials: {},
  },
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SocialIcon({ type }: { type: "linkedin" | "twitter" | "dribbble" }) {
  const paths = {
    linkedin: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    twitter: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    dribbble: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z",
  };

  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[type]} />
    </svg>
  );
}

function TeamCard({ member }: { member: TeamMember }) {
  const initials = member.name.split(" ").map(n => n[0]).join("");

  return (
    <div
      className="
        group relative overflow-hidden rounded-xl
        border border-[hsl(var(--color-border))]
        bg-[hsl(var(--color-background))]
        transition-all duration-500 ease-out
        hover:shadow-lg
      "
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-[hsl(var(--color-background-muted))] aspect-[4/3]">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            fill
            className="object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="
                w-16 h-16 text-xl
                rounded-full bg-[hsl(var(--color-background-subtle))]
                border-2 border-[hsl(var(--color-border))]
                flex items-center justify-center font-heading font-semibold
                text-[hsl(var(--color-foreground-subtle))]
                transition-transform duration-700 ease-out group-hover:scale-105
              "
            >
              {initials}
            </div>
          </div>
        )}

        {/* Gradient overlay for social links */}
        <div
          className="
            absolute inset-x-0 bottom-0 h-16
            bg-gradient-to-t from-[hsl(var(--color-foreground)/0.7)] to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500 ease-out
          "
          aria-hidden="true"
        />

        {/* Social links overlay */}
        <div
          className="
            absolute bottom-0 left-0 right-0 p-3
            flex items-center gap-2
            transform translate-y-full group-hover:translate-y-0
            transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          "
        >
          {Object.entries(member.socials).map(([type, url]) => (
            url && (
              <a
                key={type}
                href={url}
                className="
                  w-7 h-7 rounded-full
                  bg-white/20 backdrop-blur-sm
                  flex items-center justify-center
                  text-white hover:bg-white/40
                  transition-colors duration-200
                "
                aria-label={`${member.name} on ${type}`}
              >
                <SocialIcon type={type as "linkedin" | "twitter" | "dribbble"} />
              </a>
            )
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-heading tracking-tight text-base group-hover:text-[hsl(var(--color-accent))] transition-colors duration-300 inline-block relative">
          <span className="font-semibold">{member.name.split(" ")[0]}</span>
          {member.name.split(" ").length > 1 && (
            <span className="font-normal text-sm text-[hsl(var(--color-foreground-muted))] ml-1.5">
              {member.name.split(" ").slice(1).join(" ")}
            </span>
          )}
          <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[hsl(var(--color-accent))] group-hover:w-full transition-all duration-500 ease-out" />
        </h3>
        <p className="text-sm text-[hsl(var(--color-foreground-muted))] mt-0.5">
          {member.role}
        </p>
        <p className="text-xs text-[hsl(var(--color-foreground-subtle))] italic mt-1.5">
          {member.detail}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

export function Team() {
  return (
    <Section spacing="md">
      <Container>
        <div className="flex flex-col gap-10">
          {/* Header */}
          <AnimatedSection>
            <div className="flex flex-col gap-4">
              <SectionLabel number="05" label="Our team" />
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="font-semibold tracking-tight">
                    Craft & character
                  </h2>
                  <p className="text-lg text-[hsl(var(--color-foreground-muted))] max-w-xl leading-relaxed mt-3">
                    A small, focused team obsessed with quality over quantity.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          <Separator />

          {/* Equal Grid */}
          <StaggeredGrid
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            staggerDelay={0.08}
          >
            {TEAM.map((member) => (
              <StaggeredItem key={member.name}>
                <TeamCard member={member} />
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        </div>
      </Container>
    </Section>
  );
}

export function StackMarquee() {
  return (
    <AnimatedSection delay={0.2}>
      <div className="flex flex-col items-center gap-4 py-10">
        <span className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--color-foreground-subtle))]">
          Our stack & tools
        </span>
        <div
          className="marquee-container relative w-full overflow-hidden"
          aria-label="Technology stack"
        >
          <div className="marquee-track flex items-center py-3">
            <div className="marquee-content flex items-center shrink-0">
              {STACK_TOOLS.map((tool) => (
                <ToolLogo key={tool.name} tool={tool} />
              ))}
            </div>
            <div className="marquee-content flex items-center shrink-0" aria-hidden="true">
              {STACK_TOOLS.map((tool) => (
                <ToolLogo key={`dup-${tool.name}`} tool={tool} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
