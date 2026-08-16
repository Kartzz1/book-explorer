import { useState } from "react";
import { BookOpen } from "lucide-react";

function BookCover({
  book,
  className = "",
  priority = false,
}) {
  const [hasError, setHasError] = useState(false);

  const title = book?.title || "book";
  const coverSource =
    book?.coverLargeUrl ||
    book?.coverUrl ||
    null;

  const classNames = className
    ? `book-cover-image ${className}`
    : "book-cover-image";

  // Show a fallback when the book has no cover or the image fails to load.
  if (!coverSource || hasError) {
    return (
      <div
        className={`book-cover-fallback ${className}`}
        role="img"
        aria-label={`Cover unavailable for ${title}`}
      >
        <BookOpen size={34} />
        <span>Cover unavailable</span>
      </div>
    );
  }

  return (
    <img
      className={classNames}
      src={coverSource}
      alt={`Cover of ${title}`}
      loading={priority ? "eager" : "lazy"}
      onError={() => setHasError(true)}
    />
  );
}

export default BookCover;
