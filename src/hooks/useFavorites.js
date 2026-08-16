import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "book-explorer-favorites";

// Keeps a copy of the latest favorites available outside React components.
let memoryFavorites = [];

// Reads saved favorites from localStorage when the app starts.
function readStoredFavorites() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const favorites = stored ? JSON.parse(stored) : [];

    return Array.isArray(favorites) ? favorites : [];
  } catch {
    return [];
  }
}

// Saves the current favorites so they remain after refreshing the page.
function saveFavorites(favorites) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error("Could not save favorites:", error);
  }
}

export function useFavorites() {
  // Load saved books once when the hook is first created.
  const [favorites, setFavorites] = useState(() => {
    const storedFavorites = readStoredFavorites();

    memoryFavorites = storedFavorites;

    return storedFavorites;
  });

  // Keep localStorage and the in-memory copy synchronized with React state.
  useEffect(() => {
    memoryFavorites = favorites;
    saveFavorites(favorites);
  }, [favorites]);

  const addFavorite = useCallback((book) => {
    // A book without an ID cannot be saved safely.
    if (!book?.id) return;

    setFavorites((current) => {
      // Prevent the same book from being saved more than once.
      const alreadySaved = current.some(
        (favorite) => favorite.id === book.id
      );

      if (alreadySaved) {
        return current;
      }

      return [...current, book];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    // Keep every saved book except the one being removed.
    setFavorites((current) =>
      current.filter((favorite) => favorite.id !== id)
    );
  }, []);

  const isFavorite = useCallback(
    (id) =>
      favorites.some((favorite) => favorite.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (book) => {
      // Ignore invalid book data instead of changing the favorites list.
      if (!book?.id) return;

      const saved = favorites.some(
        (favorite) => favorite.id === book.id
      );

      // Remove the book if it is already saved.
      if (saved) {
        removeFavorite(book.id);
        return;
      }

      // Otherwise, add it to the favorites list.
      addFavorite(book);
    },
    [favorites, addFavorite, removeFavorite]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
  };
}

// Provides the latest favorites for code that needs access outside the hook.
export function getFavoriteSnapshot() {
  return memoryFavorites.length
    ? memoryFavorites
    : readStoredFavorites();
}
