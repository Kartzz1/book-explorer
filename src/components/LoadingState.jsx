import { LoaderCircle } from "lucide-react";

export default function LoadingState({ label = "Loading...", compact = false }) {
  return (
    <div className={`loading-state ${compact ? "compact" : ""}`} role="status" aria-live="polite">
      <LoaderCircle className="loading-spinner" size={compact ? 22 : 28} />
      <span>{label}</span>
    </div>
  );
}