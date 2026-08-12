import { useCallback, useEffect, useState } from "react";
import { getBooksByCategory, getMixedBooks, searchBooks } from "../services/openLibraryApi";

export function useBooks(initialQuery = "") {
  const [query, setQuery] = useState(initialQuery);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(Boolean(initialQuery));
  const [error, setError] = useState("");

  const search = useCallback(async (nextQuery = "") => {
    const trimmed = nextQuery.trim();

    if (!trimmed) {
      setBooks([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results = await searchBooks(trimmed);
      setBooks(results);
    } catch (requestError) {
      console.error("Book search failed:", requestError);
      setBooks([]);
      setError("The library could not be reached right now. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { query, setQuery, books, setBooks, loading, error, search };
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

    async function load() {
      setLoading(true);
      setError("");

      try {
        const results = await getBooksByCategory(category, limit);
        if (active) setBooks(results);
      } catch (requestError) {
        console.error("Category load failed:", requestError);
        if (active) {
          setBooks([]);
          setError("This collection could not be loaded right now.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [category, limit, reloadToken]);

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);
  return { books, loading, error, reload };
}

export function useHomeShelves(limit = 30) {
  const [shelves, setShelves] = useState({
    philosophy: [],
    self: [],
    stories: [],
    thinking: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      const definitions = [
        ["philosophy", "subject:philosophy"],
        ["self", 'subject:"self help" OR subject:psychology OR subject:identity OR subject:"personal growth"'],
        ["stories", "subject:fiction OR subject:literature OR subject:mystery OR subject:fantasy"],
        ["thinking", "subject:science OR subject:technology OR subject:history OR subject:knowledge"],
      ];

      const next = {};
      let successful = 0;

      try {
        // Load shelves one at a time. This intentionally avoids firing four
        // catalog requests simultaneously and is friendlier to Open Library.
        for (let index = 0; index < definitions.length; index += 1) {
          const [key, query] = definitions[index];
          try {
            next[key] = await searchBooks(query, { limit });
            if (next[key].length) successful += 1;
          } catch (requestError) {
            console.error(`Home shelf failed (${key}):`, requestError);
            next[key] = [];
          }

          if (index < definitions.length - 1) {
            await new Promise((resolve) => window.setTimeout(resolve, 1050));
          }
        }

        if (!active) return;

        setShelves({
          philosophy: next.philosophy || [],
          self: next.self || [],
          stories: next.stories || [],
          thinking: next.thinking || [],
        });

        if (!successful) {
          setError("The library is temporarily unavailable. Please try again.");
        }
      } catch (requestError) {
        console.error("Home library failed:", requestError);
        if (active) setError("The library is temporarily unavailable. Please try again.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [limit, reloadToken]);

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);
  const books = Object.values(shelves).flat();

  return { shelves, books, loading, error, reload };
}

export function useMixedBooks(limit = 30) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const results = await getMixedBooks(limit);
        if (active) setBooks(results);
      } catch (requestError) {
        console.error("Mixed library load failed:", requestError);
        if (active) {
          setBooks([]);
          setError("The library could not be loaded right now. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => { active = false; };
  }, [limit, reloadToken]);

  const reload = useCallback(() => setReloadToken((value) => value + 1), []);
  return { books, loading, error, reload };
}
