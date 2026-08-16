import { LoaderCircle } from "lucide-react";

function LoadingState({
  label = "Loading...",
  compact = false,
}) {
  const spinnerSize = compact ? 22 : 28;
  const stateClass = `loading-state${compact ? " compact" : ""}`;

  // Keep the loading layout consistent while allowing compact shelves to use a smaller spinner.
  return (
    <div
      className={stateClass}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className="loading-spinner"
        size={spinnerSize}
        aria-hidden="true"
      />

      <span>{label}</span>
    </div>
  );
}

export default LoadingState;
