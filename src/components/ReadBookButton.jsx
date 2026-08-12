import { BookOpen } from "lucide-react";
import { getReadingUrl } from "../services/openLibraryApi";

export default function ReadBookButton({ book }) {
  const url = getReadingUrl(book);
  if (!url) return null;

  return (
    <a className="primary-action" href={url} target="_blank" rel="noopener noreferrer">
      <BookOpen size={17} />
      {book.ebookAccess === "borrow" ? "Preview / Borrow" : "Read Book"}
    </a>
  );
}