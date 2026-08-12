import BookCard from "./BookCard";

export default function BookGrid({ books = [], emptyMessage = "No books found." }) {
  if (!books.length) {
    return <div className="inline-empty">{emptyMessage}</div>;
  }

  return (
    <div className="book-grid">
      {books.map((book, index) => (
        <BookCard key={`${book.id}-${index}`} book={book} index={index} />
      ))}
    </div>
  );
}