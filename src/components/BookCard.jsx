import { memo, useRef } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import FavoriteButton from "./FavoriteButton";
import { getAuthorLabel, getLanguageLabel, getYearLabel } from "../utils/bookHelpers";

function BookCard({ book, index = 0, featured = false }) {
  const ref = useRef(null);

  function handlePointerMove(event) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 768) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    ref.current.style.setProperty("--rx", `${(-y * 5).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
    ref.current.style.setProperty("--lift", "-7px");
  }

  function resetPointer() {
    if (!ref.current) return;
    ref.current.style.setProperty("--rx", "0deg");
    ref.current.style.setProperty("--ry", "0deg");
    ref.current.style.setProperty("--lift", "0px");
  }

  return (
    <article
      ref={ref}
      className={`book-card ${featured ? "featured" : ""}`}
      style={{ "--delay": `${Math.min(index * 35, 350)}ms` }}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
    >
      <Link to={`/book/${encodeURIComponent(book.id)}`} className="book-card-link" aria-label={`View details for ${book.title}`}>
        <div className="book-card-cover">
          <BookCover book={book} />
          <div className="book-card-shine" aria-hidden="true" />
          <div className="book-card-favorite">
            <FavoriteButton book={book} compact />
          </div>
        </div>

        <div className="book-card-info">
          <div className="book-meta">
            <span><CalendarDays size={13} /> {getYearLabel(book.firstPublishYear)}</span>
            {book.editionCount ? <span>{book.editionCount} editions</span> : null}
          </div>
          <h3>{book.title}</h3>
          <p>{getAuthorLabel(book)}</p>
          <div className="book-card-submeta">
            <span>{getLanguageLabel(book.languages)}</span>
            {book.publisher ? <span>{book.publisher}</span> : null}
          </div>
          <span className="book-open-link">View book <ArrowUpRight size={15} /></span>
        </div>
      </Link>
    </article>
  );
}

export default memo(BookCard);