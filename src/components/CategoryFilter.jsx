const CATEGORIES = [
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

function CategoryFilter({ value, onChange }) {
  // Keep the category options in one place so the UI stays data-driven.
  return (
    <div
      className="category-filter"
      aria-label="Book categories"
    >
      {CATEGORIES.map((category) => {
        const isActive = value === category;

        return (
          <button
            key={category}
            type="button"
            className={isActive ? "active" : ""}
            aria-pressed={isActive}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

export default CategoryFilter;
