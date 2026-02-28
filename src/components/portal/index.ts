// Portal UI components — barrel export
// /src/components/portal/index.ts

// Re-export shared types from the canonical source
export type { ProjectStatus, UpdateType } from "@/lib/portal/types";

export { StatusPill, statusPillVariants } from "./status-pill";
export type { StatusPillProps } from "./status-pill";

export { ProgressRing } from "./progress-ring";
export type { ProgressRingProps } from "./progress-ring";

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonDashboard,
} from "./skeleton";
export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonCardProps,
  SkeletonDashboardProps,
} from "./skeleton";

export { ActivityItem } from "./activity-item";
export type { ActivityItemProps } from "./activity-item";

export { ProjectCard } from "./project-card";
export type {
  ProjectCardProps,
  ProjectCardTeamMember,
} from "./project-card";

export { PortalHeader } from "./portal-header";
export type {
  PortalHeaderProps,
  PortalHeaderUser,
  BreadcrumbItem,
} from "./portal-header";

export { PortalSidebar } from "./portal-sidebar";
export type { PortalSidebarProps, SidebarProject } from "./portal-sidebar";

export { TabSystem } from "./tab-system";
export type { TabSystemProps, TabItem } from "./tab-system";

export { EmptyState } from "./empty-state";
export type { EmptyStateProps } from "./empty-state";

export { UpdateTypeBadge } from "./update-type-badge";
export type { UpdateTypeBadgeProps } from "./update-type-badge";
