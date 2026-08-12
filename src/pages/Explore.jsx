import { SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import CategoryFilter from "../components/CategoryFilter";
import BookGrid from "../components/BookGrid";
import BookShelf from "../components/BookShelf";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { useBooks, useCategoryBooks, useMixedBooks } from "../hooks/useBooks";

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const initialQuery = params.get("q") || "";
  const [category, setCategory] = useState("All");
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);

  const { query, setQuery, books, loading, error, search } = useBooks(initialQuery);
  const mixedResult = useMixedBooks(30);
  const categoryName = category === "Self" ? "self help" : category.toLowerCase();
  const categoryResult = useCategoryBooks(category === "All" ? null : categoryName, 24);

  useEffect(() => {
    if (!initialQuery) return;
    setQuery(initialQuery);
    setSubmittedQuery(initialQuery);
    search(initialQuery);
  }, [initialQuery, search, setQuery]);

  const hasSubmittedSearch = Boolean(submittedQuery.trim());
  const isSearching = category === "All" && hasSubmittedSearch;

  const displayedBooks = useMemo(() => {
    if (category !== "All") return categoryResult.books;
    if (isSearching) return books;
    return mixedResult.books;
  }, [category, categoryResult.books, books, isSearching, mixedResult.books]);

  function handleSubmit(value) {
    const trimmed = value.trim();
    if (!trimmed) return;

    setCategory("All");
    setQuery(trimmed);
    setSubmittedQuery(trimmed);
    setParams({ q: trimmed });
    search(trimmed);
  }

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    setSubmittedQuery("");

    if (nextCategory === "All") {
      setQuery("");
      setParams({});
      return;
    }

    setParams({});
  }

  const isLoading = category !== "All"
    ? categoryResult.loading
    : isSearching
      ? loading
      : mixedResult.loading;

  const activeError = category !== "All"
    ? categoryResult.error
    : isSearching
      ? error
      : mixedResult.error;

  const showSearchEmpty = isSearching && !isLoading && !activeError && displayedBooks.length === 0;

  return (
    <div className="page-shell explore-page">
      <div className="container-fluid spatial-container">
        <section className="page-intro explore-intro">
          <span className="eyebrow">Explore</span>
          <h1>Find something worth reading.</h1>
          <p>Search for something new, explore a subject, and let the next book find you.</p>
          <SearchBar value={query} onChange={setQuery} onSubmit={handleSubmit} />
        </section>

        <section className="explore-controls">
          <CategoryFilter value={category} onChange={handleCategoryChange} />
        </section>

        {isLoading ? (
          <LoadingState label={isSearching ? "Searching the Open Library catalog..." : "Arranging the library..."} />
        ) : activeError ? (
          <ErrorState
            message={activeError}
            onRetry={() => {
              if (category !== "All") categoryResult.reload();
              else if (isSearching) search(submittedQuery);
              else mixedResult.reload?.();
            }}
          />
        ) : showSearchEmpty ? (
          <div className="state-panel search-empty-state">
            <SearchX size={30} aria-hidden="true" />
            <span className="state-kicker">No results</span>
            <h2>Nothing matched that search</h2>
            <p>Try a broader title, author, subject, or keyword.</p>
          </div>
        ) : category === "All" && !isSearching ? (
          <BookShelf
            eyebrow="All books"
            title="A little of everything."
            description="A mixed shelf from the Open Library catalog. Scroll sideways and let the next subject surprise you."
            books={displayedBooks}
            loading={false}
            error={null}
            limit={30}
            emptyMessage="The library is quiet right now. Try again in a moment."
          />
        ) : (
          <section className="explore-results">
            <div className="results-heading">
              <div>
                <span className="eyebrow">{category === "All" ? "Search results" : category}</span>
                <h2>{displayedBooks.length} books on the shelf</h2>
              </div>
            </div>
            <BookGrid books={displayedBooks} emptyMessage="This category has no books available right now." />
          </section>
        )}
      </div>
    </div>
  );
}
