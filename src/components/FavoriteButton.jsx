import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

export default function FavoriteButton({ book, compact = false }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const saved = isFavorite(book?.id);

  return (
    <button
      type="button"
      className={`favorite-button ${saved ? "saved" : ""} ${compact ? "compact" : ""}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(book);
      }}
      aria-label={saved ? `Remove ${book?.title || "book"} from favorites` : `Add ${book?.title || "book"} to favorites`}
      aria-pressed={saved}
    >
      <Heart size={compact ? 17 : 19} fill={saved ? "currentColor" : "none"} />
      {!compact && <span>{saved ? "Added to Favorites" : "Add to Favorites"}</span>}
    </button>
  );
}