import { BookOpen } from "lucide-react";
import { getReadingUrl } from "../services/openLibraryApi";

export default function ReadBookButton({ book }) {
  const url = getReadingUrl(book);

  if (!url) {
    return null;
  }

  const actionLabel =
    book?.ebookAccess === "borrow" ? "Preview / Borrow" : "Read Book";

  return (
    <a
      className="primary-action"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={actionLabel}
    >
      <BookOpen size={17} aria-hidden="true" />
      <span>{actionLabel}</span>
    </a>
  );
}
