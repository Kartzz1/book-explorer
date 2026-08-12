const categories = [
  "All",
  "Philosophy",
  "Self",
  "Fiction",
  "Science",
  "History",
  "Psychology",
  "Fantasy",
  "Mystery",
];

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="category-filter" aria-label="Book categories">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={value === category ? "active" : ""}
          aria-pressed={value === category}
          onClick={() => onChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}