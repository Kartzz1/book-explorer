import { ArrowRight, Compass, Library, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import BookCover from "../components/BookCover";
import BookShelf from "../components/BookShelf";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useHomeShelves } from "../hooks/useBooks";

function FloatingBook({ book, className, depth = 0 }) {
  const [hovered, setHovered] = useState(false);

  function handlePointerMove(event) {
    if (window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${(-y * 8).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${(x * 11).toFixed(2)}deg`);
    event.currentTarget.style.setProperty("--move-x", `${(x * 12).toFixed(1)}px`);
    event.currentTarget.style.setProperty("--move-y", `${(y * 12).toFixed(1)}px`);
  }

  function resetPointer(event) {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
    event.currentTarget.style.setProperty("--move-x", "0px");
    event.currentTarget.style.setProperty("--move-y", "0px");
    setHovered(false);
  }

  return (
    <Link
      to={`/book/${encodeURIComponent(book.id)}`}
      className={`floating-book ${className} ${hovered ? "is-hovered" : ""}`}
      style={{ "--depth": `${depth}px` }}
      onPointerEnter={() => setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      aria-label={`Open ${book.title}`}
    >
      <div className="floating-book-inner">
        <BookCover book={book} priority />
        <div className="floating-book-spine" aria-hidden="true" />
        <div className="floating-book-glow" aria-hidden="true" />
      </div>
    </Link>
  );
}

function HeroBooks({ books }) {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    if (books.length <= 3) return undefined;

    const interval = window.setInterval(() => {
      setStartIndex((current) => (current + 3) % books.length);
    }, 10000);

    return () => window.clearInterval(interval);
  }, [books.length]);

  const featuredBooks = useMemo(() => {
    if (!books.length) return [];
    return [0, 1, 2].map((offset) => books[(startIndex + offset) % books.length]);
  }, [books, startIndex]);

  return (
    <div className="hero-books" aria-label="Featured books that change every ten seconds">
      {featuredBooks.map((book, index) => (
        <FloatingBook
          key={`${book.id}-${startIndex}`}
          book={book}
          depth={index * 18 + 20}
          className={`hero-book hero-book-${index + 1}`}
        />
      ))}
      {!books.length && (
        <div className="hero-book-placeholder">
          <Library size={34} />
          <span>Preparing the shelves...</span>
        </div>
      )}
      
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [heroQuery, setHeroQuery] = useState("");
  const { books, shelves, loading, error, reload } = useHomeShelves(30);

  function submitHeroSearch(query) {
    const trimmed = query.trim();
    if (trimmed) navigate(`/explore?q=${encodeURIComponent(trimmed)}`);
  }

  if (loading) {
    return (
      <div className="home-page home-data-state">
        <LoadingState label="Preparing the library..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page home-data-state">
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-ambient hero-ambient-one" aria-hidden="true" />
        <div className="hero-ambient hero-ambient-two" aria-hidden="true" />
        <div className="container-fluid spatial-container hero-grid">
          <div className="hero-copy">
            <div className="hero-kicker"><Sparkles size={14} /> A digital library</div>
            <h1>Somewhere in here, <em>your next story is waiting.</em></h1>
            <p>
              Stories, ideas, and worlds waiting to be explored — you never know what might catch your attention.
            </p>
            <SearchBar value={heroQuery} onChange={setHeroQuery} onSubmit={submitHeroSearch} />
            <div className="hero-note">
              <Compass size={15} />
              Search by title, author, subject — or just type what’s on your mind.
            </div>
          </div>

          <HeroBooks books={books} />
        </div>
      </section>

      <main className="container-fluid spatial-container home-content">
        <BookShelf
          eyebrow="Think deeply"
          title="Philosophy"
          description="Ideas about meaning, existence, ethics, wisdom, and human nature."
          books={shelves.philosophy}
          loading={false}
          error={null}
          query="philosophy"
          emptyMessage="This shelf is quiet right now. Explore the wider catalog to keep reading."
        />

        <BookShelf
          eyebrow="Look inward"
          title="Self / Personal Growth"
          description="Reflection, identity, psychology, and the long work of becoming."
          books={shelves.self}
          loading={false}
          error={null}
          query="self help"
          emptyMessage="This shelf is quiet right now. Explore the wider catalog to keep reading."
        />

        <BookShelf
          eyebrow="Get lost in a story"
          title="Stories"
          description="Fiction, literature, classics, mystery, and fantasy from the catalog."
          books={shelves.stories}
          loading={false}
          error={null}
          query="fiction"
          emptyMessage="This shelf is quiet right now. Explore the wider catalog to keep reading."
        />

        <BookShelf
          eyebrow="Keep learning"
          title="Think / Learn"
          description="Science, technology, history, and books built around curiosity."
          books={shelves.thinking}
          loading={false}
          error={null}
          query="science technology"
          emptyMessage="This shelf is quiet right now. Explore the wider catalog to keep reading."
        />

        <section className="explore-cta">
          <div>
            <span className="eyebrow">The shelves continue</span>
            <h2>There is more to discover.</h2>
            <p>The shelves are just the beginning, there’s plenty more waiting to be explored.</p>
          </div>
          <Link className="primary-action" to="/explore">
            Explore More <ArrowRight size={17} />
          </Link>
        </section>
      </main>
    </div>
  );
}
