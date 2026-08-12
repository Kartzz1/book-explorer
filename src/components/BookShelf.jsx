import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import BookCard from "./BookCard";
import LoadingState from "./LoadingState";

export default function BookShelf({
  title,
  eyebrow,
  description,
  books,
  loading,
  error,
  query,
  limit = 12,
  rotateEvery = 10000,
  emptyMessage = "This shelf is quiet right now.",
}) {
  const [start, setStart] = useState(0);

  useEffect(() => {
    setStart(0);
  }, [books]);

  useEffect(() => {
    if (books.length <= limit || rotateEvery <= 0) return undefined;

    const timer = window.setInterval(() => {
      setStart((current) => (current + limit) % books.length);
    }, rotateEvery);

    return () => window.clearInterval(timer);
  }, [books.length, limit, rotateEvery]);

  const visibleBooks = useMemo(() => {
    if (!books.length) return [];
    return Array.from({ length: Math.min(limit, books.length) }, (_, index) =>
      books[(start + index) % books.length]
    );
  }, [books, limit, start]);

  return (
    <section className="shelf-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {query && (
          <Link className="section-link" to={`/explore?q=${encodeURIComponent(query)}`}>
            Explore collection <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {loading ? (
        <LoadingState compact label="Arranging this shelf..." />
      ) : error ? (
        <div className="shelf-error">{error}</div>
      ) : visibleBooks.length ? (
        <div className="shelf-track" aria-label={`${title} books`}>
          {visibleBooks.map((book, index) => (
            <BookCard key={`${book.id}-${start}-${index}`} book={book} index={index} />
          ))}
        </div>
      ) : (
        <div className="shelf-empty" role="status">{emptyMessage}</div>
      )}
    </section>
  );
}
