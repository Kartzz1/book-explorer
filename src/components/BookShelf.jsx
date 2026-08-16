import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import LoadingState from "./LoadingState";

function BookShelf({
  title,
  eyebrow,
  description,
  books = [],
  loading,
  error,
  query,
  limit = 12,
  rotateEvery = 10000,
  emptyMessage = "This shelf is quiet right now.",
}) {
  const [start, setStart] = useState(0);

  const shouldRotate =
    books.length > limit && rotateEvery > 0;

  // Start from the beginning whenever a new shelf is loaded.
  useEffect(() => {
    setStart(0);
  }, [books]);

  // Move the shelf forward automatically when there are more books than shown.
  useEffect(() => {
    if (!shouldRotate) return;

    const timer = window.setInterval(() => {
      setStart((current) => (current + limit) % books.length);
    }, rotateEvery);

    return () => window.clearInterval(timer);
  }, [shouldRotate, books.length, limit, rotateEvery]);

  const visibleBooks = useMemo(() => {
    if (!books.length) return [];

    const count = Math.min(limit, books.length);

    return Array.from({ length: count }, (_, index) => {
      return books[(start + index) % books.length];
    });
  }, [books, limit, start]);

  const exploreUrl = query
    ? `/explore?q=${encodeURIComponent(query)}`
    : null;

  return (
    <section className="shelf-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>

          <h2>{title}</h2>

          {description && <p>{description}</p>}
        </div>

        {exploreUrl && (
          <Link
            className="section-link"
            to={exploreUrl}
          >
            Explore collection
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {loading && (
        <LoadingState
          compact
          label="Arranging this shelf..."
        />
      )}

      {!loading && error && (
        <div className="shelf-error">
          {error}
        </div>
      )}

      {!loading && !error && visibleBooks.length > 0 && (
        <div
          className="shelf-track"
          aria-label={`${title} books`}
        >
          {visibleBooks.map((book, index) => (
            <BookCard
              key={`${book.id}-${start}-${index}`}
              book={book}
              index={index}
            />
          ))}
        </div>
      )}

      {!loading && !error && visibleBooks.length === 0 && (
        <div
          className="shelf-empty"
          role="status"
        >
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

export default BookShelf;
