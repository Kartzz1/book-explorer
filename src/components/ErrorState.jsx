import { RefreshCcw } from "lucide-react";

export default function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="state-panel error-state" role="alert">
      <span className="state-kicker">Connection issue</span>
      <h2>The shelf is temporarily unavailable.</h2>
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="secondary-action button-reset" onClick={onRetry}>
          <RefreshCcw size={16} /> Try again
        </button>
      )}
    </div>
  );
}