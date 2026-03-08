// Portal UI components — barrel export

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
export type { ProjectCardProps } from "./project-card";

export { ProjectCardV2 } from "./project-card-v2";
export type { ProjectCardV2Props } from "./project-card-v2";

export { MilestoneTimeline } from "./milestone-timeline";
export type { MilestoneTimelineProps, Milestone } from "./milestone-timeline";

export { MessageButton } from "./message-button";

export { EmptyState } from "./empty-state";
export type { EmptyStateProps } from "./empty-state";

export { UpdateTypeBadge } from "./update-type-badge";
export type { UpdateTypeBadgeProps } from "./update-type-badge";
