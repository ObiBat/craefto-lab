export default function PortalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-background))]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[hsl(var(--color-border))] border-t-[hsl(var(--color-foreground))]" />
        <p className="text-sm text-[hsl(var(--color-foreground-muted))] font-[family-name:var(--font-heading)]">
          Loading...
        </p>
      </div>
    </div>
  );
}
