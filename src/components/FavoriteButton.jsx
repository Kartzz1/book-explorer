import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

export default function FavoriteButton({ book, compact = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(book?.id);

  // Keep the favorite action independent from the parent book link.
  function handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(book);
  }

  const label = saved
    ? `Remove ${book?.title || "book"} from favorites`
    : `Add ${book?.title || "book"} to favorites`;

  return (
    <button
      type="button"
      className={`favorite-button ${saved ? "saved" : ""} ${
        compact ? "compact" : ""
      }`}
      onClick={handleClick}
      aria-label={label}
      aria-pressed={saved}
    >
      <Heart
        size={compact ? 17 : 19}
        fill={saved ? "currentColor" : "none"}
        aria-hidden="true"
      />

      {!compact && (
        <span>{saved ? "Added to Favorites" : "Add to Favorites"}</span>
      )}
    </button>
  );
}
