import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import BookGrid from "../components/BookGrid";
import EmptyState from "../components/EmptyState";

export default function Favorites() {
  const { favorites } = useFavorites();

  return (
    <div className="page-shell">
      <div className="container-fluid spatial-container">
        <section className="page-intro compact-intro">
          <span className="eyebrow"><Heart size={14} /> Your favorites</span>
          <h1>Books worth coming back to.</h1>
          <p>Your saved shelf lives in this browser and remains here between visits.</p>
        </section>

        {favorites.length ? (
          <BookGrid books={favorites} emptyMessage="Your saved shelf is empty." />
        ) : (
          <EmptyState
            title="Your library is waiting."
            message="Save books you want to remember, then return whenever you are ready."
            actionLabel="Explore Books"
            actionTo="/explore"
          />
        )}
      </div>
    </div>
  );
}