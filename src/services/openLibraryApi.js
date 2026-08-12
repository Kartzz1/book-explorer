import axios from "axios";

const OPEN_LIBRARY_ORIGIN = "https://openlibrary.org";
const IS_PRODUCTION = import.meta.env.PROD;
const CACHE_TTL = 5 * 60 * 1000;
const memoryCache = new Map();
let requestChain = Promise.resolve();
let lastDirectRequestAt = 0;

const api = axios.create({
  baseURL: IS_PRODUCTION ? "/api/openlibrary" : OPEN_LIBRARY_ORIGIN,
  timeout: 15000,
  headers: { Accept: "application/json" },
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cacheKey(path, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => search.set(key, String(value)));

  return `${path}?${search.toString()}`;
}

function readSessionCache(key) {
  try {
    const raw = sessionStorage.getItem(`book-explorer-api:${key}`);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(`book-explorer-api:${key}`);
      return null;
    }

    return cached.data;
  } catch {
    return null;
  }
}

function writeSessionCache(key, data) {
  try {
    sessionStorage.setItem(
      `book-explorer-api:${key}`,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // Storage can be disabled or full. The in-memory cache still works.
  }
}

async function waitForDirectRateLimit() {
  if (IS_PRODUCTION) return;

  const elapsed = Date.now() - lastDirectRequestAt;
  const wait = Math.max(0, 1050 - elapsed);
  if (wait) await sleep(wait);
  lastDirectRequestAt = Date.now();
}

function queuedDirectRequest(request) {
  const next = requestChain.then(async () => {
    await waitForDirectRateLimit();
    return request();
  });

  requestChain = next.catch(() => undefined);
  return next;
}

async function requestJson(path, params = {}) {
  const key = cacheKey(path, params);
  const memory = memoryCache.get(key);
  if (memory && Date.now() - memory.timestamp < CACHE_TTL) return memory.data;

  const session = readSessionCache(key);
  if (session) {
    memoryCache.set(key, { timestamp: Date.now(), data: session });
    return session;
  }

  const request = async () => {
    const requestParams = IS_PRODUCTION ? { path, ...params } : params;
    const response = await api.get(IS_PRODUCTION ? "" : path, {
      params: requestParams,
    });
    return response.data;
  };

  let lastError;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const data = IS_PRODUCTION
        ? await request()
        : await queuedDirectRequest(request);

      memoryCache.set(key, { timestamp: Date.now(), data });
      writeSessionCache(key, data);
      return data;
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const retryable = !status || status === 408 || status === 429 || status >= 500;
      if (!retryable || attempt === 1) break;
      await sleep(500 * (attempt + 1));
    }
  }

  throw lastError || new Error("Open Library request failed.");
}

function coverUrl(coverId, size = "M") {
  return coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
    : null;
}

function coverEditionUrl(olid, size = "M") {
  return olid
    ? `https://covers.openlibrary.org/b/olid/${encodeURIComponent(olid)}-${size}.jpg`
    : null;
}

function cleanText(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean).join("\n\n");
  }

  if (value && typeof value === "object") {
    return value.value || value.text || value.name || "";
  }

  return typeof value === "string" ? value : "";
}

const SEARCH_FIELDS = [
  "key",
  "title",
  "author_name",
  "author_key",
  "first_publish_year",
  "cover_i",
  "cover_edition_key",
  "edition_count",
  "language",
  "subject",
  "publisher",
  "isbn",
  "ebook_access",
  "has_fulltext",
  "ia",
].join(",");

export function normalizeSearchDoc(doc) {
  const key = doc.key || "";
  const id = key.replace(/^\/works\//, "").replace(/^\/books\//, "");

  return {
    id,
    key,
    title: doc.title || "Untitled book",
    authors: Array.isArray(doc.author_name) ? doc.author_name : [],
    authorKeys: Array.isArray(doc.author_key) ? doc.author_key : [],
    firstPublishYear: doc.first_publish_year || null,
    coverId: doc.cover_i || null,
    coverEditionKey: doc.cover_edition_key || null,
    coverUrl: coverUrl(doc.cover_i, "M") || coverEditionUrl(doc.cover_edition_key, "M"),
    coverLargeUrl: coverUrl(doc.cover_i, "L") || coverEditionUrl(doc.cover_edition_key, "L"),
    editionCount: doc.edition_count || 0,
    languages: Array.isArray(doc.language) ? doc.language : [],
    subjects: Array.isArray(doc.subject) ? doc.subject.slice(0, 12) : [],
    publisher: Array.isArray(doc.publisher) ? doc.publisher[0] : null,
    isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : null,
    ebookAccess: doc.ebook_access || null,
    hasFulltext: Boolean(doc.has_fulltext),
    ia: Array.isArray(doc.ia) ? doc.ia : [],
    openLibraryUrl: id
      ? `https://openlibrary.org/works/${id}`
      : key
        ? `https://openlibrary.org${key}`
        : null,
  };
}

export async function searchBooks(query, options = {}) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const data = await requestJson("/search.json", {
    q: trimmed,
    limit: Math.min(options.limit ?? 24, 40),
    page: options.page ?? 1,
    fields: SEARCH_FIELDS,
  });

  return (data.docs || []).map(normalizeSearchDoc);
}

export async function getBooksByCategory(category, limit = 12) {
  const safeCategory = category.trim();
  if (!safeCategory) return [];

  const data = await requestJson("/search.json", {
    q: `subject:"${safeCategory.replaceAll('"', "")}"`,
    limit: Math.min(limit, 30),
    fields: SEARCH_FIELDS,
  });

  return (data.docs || []).map(normalizeSearchDoc);
}

export async function getMixedBooks(limit = 30) {
  // One request is deliberately used here. Open Library asks clients to keep
  // traffic low and cache responses; six parallel subject requests made the
  // old All view prone to rate limiting and intermittent failures.
  const query = [
    'subject:philosophy',
    'subject:"self help"',
    'subject:fiction',
    'subject:science',
    'subject:technology',
    'subject:history',
    'subject:psychology',
    'subject:fantasy',
    'subject:mystery',
  ].join(" OR ");

  const data = await requestJson("/search.json", {
    q: query,
    limit: Math.min(Math.max(limit, 24), 60),
    fields: SEARCH_FIELDS,
  });

  const seen = new Set();
  return (data.docs || [])
    .map(normalizeSearchDoc)
    .filter((book) => {
      if (!book.id || seen.has(book.id)) return false;
      seen.add(book.id);
      return true;
    })
    .slice(0, limit);
}

export async function getEditionMetadata(id, limit = 5) {
  const safeId = decodeURIComponent(id)
    .replace(/^\/works\//, "")
    .replace(/^\/books\//, "");

  if (!/^[A-Za-z0-9_-]+$/.test(safeId)) return null;

  try {
    const data = await requestJson(`/works/${encodeURIComponent(safeId)}/editions.json`, {
      limit: Math.min(Math.max(limit, 1), 10),
      fields: "key,title,publish_date,publishers,languages,covers,isbn,number_of_pages,physical_format"
    });

    const entries = Array.isArray(data?.entries) ? data.entries : [];
    const edition = entries.find((entry) => entry?.covers?.length || entry?.languages?.length || entry?.publishers?.length) || entries[0];
    if (!edition) return null;

    const languages = Array.isArray(edition.languages)
      ? edition.languages.map((item) => {
          if (typeof item === "string") return item.split("/").pop();
          return item?.key ? item.key.split("/").pop() : item?.name || "";
        }).filter(Boolean)
      : [];

    return {
      coverIds: Array.isArray(edition.covers) ? edition.covers : [],
      languages,
      publishers: Array.isArray(edition.publishers) ? edition.publishers : [],
      publishDate: edition.publish_date || null,
      isbn: Array.isArray(edition.isbn) ? edition.isbn[0] : null,
      numberOfPages: edition.number_of_pages || null,
      physicalFormat: edition.physical_format || null,
      key: edition.key || null,
    };
  } catch (error) {
    console.warn("Edition metadata unavailable:", error);
    return null;
  }
}

export async function getBookDetails(id) {
  const safeId = decodeURIComponent(id)
    .replace(/^\/works\//, "")
    .replace(/^\/books\//, "");

  if (!/^[A-Za-z0-9_-]+$/.test(safeId)) {
    throw new Error("Invalid book identifier.");
  }

  const data = await requestJson(`/works/${encodeURIComponent(safeId)}.json`);

  const authors = Array.isArray(data.authors)
    ? data.authors
        .map((author) => author?.author?.key || author?.key)
        .filter(Boolean)
        .map((key) => key.split("/").pop())
    : [];

  const subjects = [
    ...(Array.isArray(data.subjects) ? data.subjects : []),
    ...(Array.isArray(data.subject_people) ? data.subject_people : []),
    ...(Array.isArray(data.subject_places) ? data.subject_places : []),
  ]
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 20);

  return {
    id: safeId,
    title: data.title || "Untitled book",
    description: cleanText(data.description) || "",
    coverIds: Array.isArray(data.covers) ? data.covers : [],
    coverUrl: data.covers?.[0] ? coverUrl(data.covers[0], "L") : null,
    authors,
    subjects,
    firstPublishYear: data.first_publish_date || null,
    revision: data.revision || null,
    latestRevision: data.latest_revision || null,
    created: data.created?.value || null,
    openLibraryUrl: `https://openlibrary.org/works/${safeId}`,
  };
}

export function getReadingUrl(book) {
  if (!book) return null;

  const ia = Array.isArray(book.ia) ? book.ia.find(Boolean) : null;
  if (ia && (book.ebookAccess === "public" || book.hasFulltext || book.ebookAccess === "borrow")) {
    return `https://archive.org/details/${encodeURIComponent(ia)}`;
  }

  return null;
}

export { coverUrl, coverEditionUrl };
