import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "book-explorer-favorites";
let memoryFavorites = [];

function readStoredFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredFavorites(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Could not persist favorites:", error);
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(() => {
    const initial = readStoredFavorites();
    memoryFavorites = initial;
    return initial;
  });

  useEffect(() => {
    memoryFavorites = favorites;
    writeStoredFavorites(favorites);
  }, [favorites]);

  const addFavorite = useCallback((book) => {
    if (!book?.id) return;

    setFavorites((current) => {
      if (current.some((item) => item.id === book.id)) return current;
      return [...current, book];
    });
  }, []);

  const removeFavorite = useCallback((id) => {
    setFavorites((current) => current.filter((item) => item.id !== id));
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.some((item) => item.id === id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (book) => {
      if (!book?.id) return;
      if (favorites.some((item) => item.id === book.id)) {
        removeFavorite(book.id);
      } else {
        addFavorite(book);
      }
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

export function getFavoriteSnapshot() {
  return memoryFavorites.length ? memoryFavorites : readStoredFavorites();
}