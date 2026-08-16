import BookCard from "./BookCard";

function BookGrid({
  books = [],
  emptyMessage = "No books found.",
}) {
  const hasBooks = books.length > 0;

  // Keep the empty state here so BookGrid controls the whole collection view.
  if (!hasBooks) {
    return (
      <div className="inline-empty">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="book-grid">
      {books.map((book, index) => (
        <BookCard
          key={`${book.id}-${index}`}
          book={book}
          index={index}
        />
      ))}
    </div>
  );
}

export default BookGrid;
