import { BookOpen } from "lucide-react";
import { useState } from "react";

export default function BookCover({ book, className = "", priority = false }) {
  const [failed, setFailed] = useState(false);
  const src = book?.coverLargeUrl || book?.coverUrl || null;

  if (!src || failed) {
    return (
      <div className={`book-cover-fallback ${className}`} role="img" aria-label={`Cover unavailable for ${book?.title || "book"}`}>
        <BookOpen size={34} />
        <span>Cover unavailable</span>
      </div>
    );
  }

  return (
    <img
      className={`book-cover-image ${className}`}
      src={src}
      alt={`Cover of ${book?.title || "book"}`}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}