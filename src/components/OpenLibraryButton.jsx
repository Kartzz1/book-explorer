import { ExternalLink } from "lucide-react";
import { getOpenLibraryUrl } from "../utils/bookHelpers";

export default function OpenLibraryButton({ book }) {
  const url = getOpenLibraryUrl(book);
  if (!url) return null;

  return (
    <a className="secondary-action" href={url} target="_blank" rel="noopener noreferrer">
      View on Open Library
      <ExternalLink size={16} />
    </a>
  );
}