import { memo, useRef } from "react";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import BookCover from "./BookCover";
import FavoriteButton from "./FavoriteButton";
import {
  getAuthorLabel,
  getLanguageLabel,
  getYearLabel,
} from "../utils/bookHelpers";

function BookCard({
  book,
  index = 0,
  featured = false,
}) {
  const cardRef = useRef(null);

  const cardClassName = [
    "book-card",
    featured && "featured",
  ]
    .filter(Boolean)
    .join(" ");

  const animationDelay = `${Math.min(index * 35, 350)}ms`;

  const handlePointerMove = (event) => {
    const card = cardRef.current;

    // Skip the tilt effect when motion is disabled or the screen is small.
    if (
      !card ||
      window.innerWidth < 768 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const rect = card.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    const rotateX = (-y * 5).toFixed(2);
    const rotateY = (x * 7).toFixed(2);

    card.style.setProperty("--rx", `${rotateX}deg`);
    card.style.setProperty("--ry", `${rotateY}deg`);
    card.style.setProperty("--lift", "-7px");
  };

  const handlePointerLeave = () => {
    const card = cardRef.current;

    if (!card) return;

    // Return the card to its normal position when the pointer leaves.
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    card.style.setProperty("--lift", "0px");
  };

  const year = getYearLabel(book.firstPublishYear);
  const author = getAuthorLabel(book);
  const language = getLanguageLabel(book.languages);

  return (
    <article
      ref={cardRef}
      className={cardClassName}
      style={{ "--delay": animationDelay }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <Link
        to={`/book/${encodeURIComponent(book.id)}`}
        className="book-card-link"
        aria-label={`View details for ${book.title}`}
      >
        <div className="book-card-cover">
          <BookCover book={book} />

          <div
            className="book-card-shine"
            aria-hidden="true"
          />

          <div className="book-card-favorite">
            <FavoriteButton
              book={book}
              compact
            />
          </div>
        </div>

        <div className="book-card-info">
          <div className="book-meta">
            <span>
              <CalendarDays size={13} />
              {year}
            </span>

            {book.editionCount ? (
              <span>
                {book.editionCount} editions
              </span>
            ) : null}
          </div>

          <h3>{book.title}</h3>

          <p>{author}</p>

          <div className="book-card-submeta">
            <span>{language}</span>

            {book.publisher ? (
              <span>{book.publisher}</span>
            ) : null}
          </div>

          <span className="book-open-link">
            View book
            <ArrowUpRight size={15} />
          </span>
        </div>
      </Link>
    </article>
  );
}

export default memo(BookCard);
