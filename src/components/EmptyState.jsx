import { LibraryBig } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ title = "Nothing here yet.", message = "Try another search.", actionLabel, actionTo }) {
  return (
    <div className="state-panel">
      <div className="empty-icon" aria-hidden="true"><LibraryBig size={26} /></div>
      <span className="state-kicker">Empty shelf</span>
      <h2>{title}</h2>
      <p>{message}</p>
      {actionLabel && actionTo && <Link className="primary-action" to={actionTo}>{actionLabel}</Link>}
    </div>
  );
}