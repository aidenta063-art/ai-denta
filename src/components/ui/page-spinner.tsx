export function PageSpinner({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <div
      className={
        variant === "dark"
          ? "flex min-h-[60vh] items-center justify-center bg-[#251037]"
          : "flex min-h-[60vh] items-center justify-center"
      }
    >
      <div
        className={
          variant === "dark"
            ? "size-8 animate-spin rounded-full border-2 border-white/20 border-t-white"
            : "size-8 animate-spin rounded-full border-2 border-border border-t-primary"
        }
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
