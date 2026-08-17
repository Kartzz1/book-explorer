import { Heart } from "lucide-react";

import { useFavorites } from "../hooks/useFavorites";
import BookGrid from "../components/BookGrid";
import EmptyState from "../components/EmptyState";


const FAVORITES_CONTENT = {
  title: "Books worth coming back to.",
  description:
    "Your saved shelf lives in this browser and remains here between visits.",
  emptyTitle: "Your library is waiting.",
  emptyMessage:
    "Save books you want to remember, then return whenever you are ready.",
};


export default function Favorites() {
  const { favorites } = useFavorites();

  const hasFavorites = favorites.length > 0;


  return (
    <div className="page-shell">
      <div className="container-fluid spatial-container">

        <section className="page-intro compact-intro">
          <span className="eyebrow">
            <Heart size={14} />
            Your favorites
          </span>

          <h1>
            {FAVORITES_CONTENT.title}
          </h1>

          <p>
            {FAVORITES_CONTENT.description}
          </p>
        </section>


        {hasFavorites ? (
          <BookGrid
            books={favorites}
            emptyMessage="Your saved shelf is empty."
          />
        ) : (
          // Empty state guides users back to discovering new books.
          <EmptyState
            title={FAVORITES_CONTENT.emptyTitle}
            message={FAVORITES_CONTENT.emptyMessage}
            actionLabel="Explore Books"
            actionTo="/explore"
          />
        )}

      </div>
    </div>
  );
}
