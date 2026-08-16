import { useCallback, useEffect, useState } from "react";
import {
  getBooksByCategory,
  getMixedBooks,
  searchBooks,
} from "../services/openLibraryApi";

const HOME_SHELVES = [
  {
    key: "philosophy",
    query: "subject:philosophy",
  },
  {
    key: "self",
    query:
      'subject:"self help" OR subject:psychology OR subject:identity OR subject:"personal growth"',
  },
  {
    key: "stories",
    query:
      "subject:fiction OR subject:literature OR subject:mystery OR subject:fantasy",
  },
  {
    key: "thinking",
    query:
      "subject:science OR subject:technology OR subject:history OR subject:knowledge",
  },
];

const EMPTY_SHELVES = {
  philosophy: [],
  self: [],
  stories: [],
  thinking: [],
};

const wait = (ms) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export function useBooks(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");

  const search = useCallback(async (nextQuery = "") => {
    const trimmedQuery = nextQuery.trim();

    if (!trimmedQuery) {
      setBooks([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await searchBooks(trimmedQuery);
      setBooks(results);
    } catch (requestError) {
      console.error("Book search failed:", requestError);
      setBooks([]);
      setError(
        "The library could not be reached right now. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    query,
    setQuery,
    books,
    setBooks,
    loading,
    error,
    search,
  };
}

export function useCategoryBooks(category, limit = 10) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(Boolean(category));
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    if (!category) {
      setBooks([]);
      setLoading(false);
      setError("");
      return undefined;
    }

    let active = true;

    const loadCategory = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await getBooksByCategory(category, limit);

        if (active) {
          setBooks(results);
        }
      } catch (requestError) {
        console.error("Category load failed:", requestError);

        if (active) {
          setBooks([]);
          setError("This collection could not be loaded right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategory();

    return () => {
      active = false;
    };
  }, [category, limit, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  return {
    books,
    loading,
    error,
    reload,
  };
}

export function useHomeShelves(limit = 30) {
  const [shelves, setShelves] = useState(EMPTY_SHELVES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    const loadShelves = async () => {
      setLoading(true);
      setError("");

      const loadedShelves = {};
      let successfulShelves = 0;

      for (let index = 0; index < HOME_SHELVES.length; index += 1) {
        const { key, query } = HOME_SHELVES[index];

        try {
          loadedShelves[key] = await searchBooks(query, { limit });

          if (loadedShelves[key].length > 0) {
            successfulShelves += 1;
          }
        } catch (requestError) {
          console.error(`Home shelf failed (${key}):`, requestError);
          loadedShelves[key] = [];
        }

        // Leave a short gap between catalog requests.
        if (index < HOME_SHELVES.length - 1) {
          await wait(1050);
        }
      }

      if (!active) return;

      setShelves({
        philosophy: loadedShelves.philosophy || [],
        self: loadedShelves.self || [],
        stories: loadedShelves.stories || [],
        thinking: loadedShelves.thinking || [],
      });

      if (!successfulShelves) {
        setError(
          "The library is temporarily unavailable. Please try again."
        );
      }

      setLoading(false);
    };

    loadShelves();

    return () => {
      active = false;
    };
  }, [limit, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  const books = Object.values(shelves).flat();

  return {
    shelves,
    books,
    loading,
    error,
    reload,
  };
}

export function useMixedBooks(limit = 30) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    const loadBooks = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await getMixedBooks(limit);

        if (active) {
          setBooks(results);
        }
      } catch (requestError) {
        console.error("Mixed library load failed:", requestError);

        if (active) {
          setBooks([]);
          setError(
            "The library could not be loaded right now. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBooks();

    return () => {
      active = false;
    };
  }, [limit, reloadToken]);

  const reload = useCallback(() => {
    setReloadToken((current) => current + 1);
  }, []);

  return {
    books,
    loading,
    error,
    reload,
  };
}
