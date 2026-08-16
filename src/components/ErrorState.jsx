import { RefreshCcw } from "lucide-react";

function ErrorState({
  message = "Something went wrong.",
  onRetry,
}) {
  const canRetry = typeof onRetry === "function";

  // Show the retry action only when the parent provides a valid handler.
  return (
    <div
      className="state-panel error-state"
      role="alert"
    >
      <span className="state-kicker">
        Connection issue
      </span>

      <h2>The shelf is temporarily unavailable.</h2>

      <p>{message}</p>

      {canRetry && (
        <button
          type="button"
          className="secondary-action button-reset"
          onClick={onRetry}
        >
          <RefreshCcw size={16} />
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
