import { ExternalLink } from "lucide-react";
import { getOpenLibraryUrl } from "../utils/bookHelpers";

export default function OpenLibraryButton({ book }) {
  const url = getOpenLibraryUrl(book);

  if (!url) {
    return null;
  }

  return (
    <a
      className="secondary-action"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View this book on Open Library"
    >
      <span>View on Open Library</span>
      <ExternalLink size={16} aria-hidden="true" />
    </a>
  );
}
