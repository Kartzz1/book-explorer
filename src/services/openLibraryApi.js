import axios from "axios";

const OPEN_LIBRARY_URL = "https://openlibrary.org";
const COVERS_URL = "https://covers.openlibrary.org";
const ARCHIVE_URL = "https://archive.org";

const IS_PRODUCTION = import.meta.env.PROD;
const CACHE_TTL = 5 * 60 * 1000;
const MAX_SEARCH_LIMIT = 40;

const memoryCache = new Map();

let requestQueue = Promise.resolve();
let lastRequestTime = 0;

const api = axios.create({
  baseURL: IS_PRODUCTION ? "/api/openlibrary" : OPEN_LIBRARY_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

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

const HOME_QUERY = [
  "subject:philosophy",
  'subject:"self help"',
  "subject:fiction",
  "subject:science",
  "subject:technology",
  "subject:history",
  "subject:psychology",
  "subject:fantasy",
  "subject:mystery",
].join(" OR ");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCacheKey(path, params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      searchParams.set(key, String(value));
    });

  return `${path}?${searchParams.toString()}`;
}

function readSessionCache(key) {
  try {
    const raw = sessionStorage.getItem(`book-explorer-api:${key}`);

    if (!raw) return null;

    const cached = JSON.parse(raw);

    if (
      !cached ||
      typeof cached.timestamp !== "number" ||
      Date.now() - cached.timestamp >= CACHE_TTL
    ) {
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
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
  } catch {
    // Storage failure should never prevent the API request from succeeding.
  }
}

function getCachedData(key) {
  const memoryEntry = memoryCache.get(key);

  if (memoryEntry && Date.now() - memoryEntry.timestamp < CACHE_TTL) {
    return memoryEntry.data;
  }

  memoryCache.delete(key);

  const sessionData = readSessionCache(key);

  if (sessionData !== null) {
    memoryCache.set(key, {
      timestamp: Date.now(),
      data: sessionData,
    });

    return sessionData;
  }

  return null;
}

function saveCachedData(key, data) {
  memoryCache.set(key, {
    timestamp: Date.now(),
    data,
  });

  writeSessionCache(key, data);
}

async function waitForRateLimit() {
  if (IS_PRODUCTION) return;

  const elapsed = Date.now() - lastRequestTime;
  const remainingDelay = Math.max(0, 1050 - elapsed);

  if (remainingDelay > 0) {
    await sleep(remainingDelay);
  }

  lastRequestTime = Date.now();
}

function queueDirectRequest(request) {
  const nextRequest = requestQueue.then(async () => {
    await waitForRateLimit();
    return request();
  });

  requestQueue = nextRequest.catch(() => undefined);

  return nextRequest;
}

function shouldRetry(error) {
  const status = error?.response?.status;

  return (
    !status ||
    status === 408 ||
    status === 429 ||
    status >= 500
  );
}

async function requestJson(path, params = {}) {
  const key = buildCacheKey(path, params);
  const cached = getCachedData(key);

  if (cached !== null) {
    return cached;
  }

  const request = async () => {
    const requestParams = IS_PRODUCTION
      ? { path, ...params }
      : params;

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
        : await queueDirectRequest(request);

      saveCachedData(key, data);

      return data;
    } catch (error) {
      lastError = error;

      if (!shouldRetry(error) || attempt === 1) {
        break;
      }

      await sleep(500 * (attempt + 1));
    }
  }

  throw lastError || new Error("Open Library request failed.");
}

function createCoverUrl(coverId, size = "M") {
  if (!coverId) return null;

  return `${COVERS_URL}/b/id/${coverId}-${size}.jpg`;
}

function createEditionCoverUrl(editionKey, size = "M") {
  if (!editionKey) return null;

  return `${COVERS_URL}/b/olid/${encodeURIComponent(
    editionKey
  )}-${size}.jpg`;
}

function cleanText(value) {
  if (Array.isArray(value)) {
    return value
      .map(cleanText)
      .filter(Boolean)
      .join("\n\n");
  }

  if (value && typeof value === "object") {
    return value.value || value.text || value.name || "";
  }

  return typeof value === "string" ? value : "";
}

function normalizeBookId(key = "") {
  return key
    .replace(/^\/works\//, "")
    .replace(/^\/books\//, "");
}

function normalizeWorkId(id) {
  const decoded = decodeURIComponent(id || "");

  return normalizeBookId(decoded);
}

function isValidWorkId(id) {
  return /^[A-Za-z0-9_-]+$/.test(id);
}

export function normalizeSearchDoc(doc = {}) {
  const key = doc.key || "";
  const id = normalizeBookId(key);

  const coverUrl =
    createCoverUrl(doc.cover_i, "M") ||
    createEditionCoverUrl(doc.cover_edition_key, "M");

  const coverLargeUrl =
    createCoverUrl(doc.cover_i, "L") ||
    createEditionCoverUrl(doc.cover_edition_key, "L");

  return {
    id,
    key,
    title: doc.title || "Untitled book",
    authors: Array.isArray(doc.author_name) ? doc.author_name : [],
    authorKeys: Array.isArray(doc.author_key) ? doc.author_key : [],
    firstPublishYear: doc.first_publish_year || null,
    coverId: doc.cover_i || null,
    coverEditionKey: doc.cover_edition_key || null,
    coverUrl,
    coverLargeUrl,
    editionCount: doc.edition_count || 0,
    languages: Array.isArray(doc.language) ? doc.language : [],
    subjects: Array.isArray(doc.subject)
      ? doc.subject.slice(0, 12)
      : [],
    publisher: Array.isArray(doc.publisher)
      ? doc.publisher[0] || null
      : null,
    isbn: Array.isArray(doc.isbn)
      ? doc.isbn[0] || null
      : null,
    ebookAccess: doc.ebook_access || null,
    hasFulltext: Boolean(doc.has_fulltext),
    ia: Array.isArray(doc.ia) ? doc.ia : [],
    openLibraryUrl: id
      ? `${OPEN_LIBRARY_URL}/works/${id}`
      : key
        ? `${OPEN_LIBRARY_URL}${key}`
        : null,
  };
}

export async function searchBooks(query, options = {}) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return [];

  const limit = Math.min(
    options.limit ?? 24,
    MAX_SEARCH_LIMIT
  );

  const data = await requestJson("/search.json", {
    q: trimmedQuery,
    limit,
    page: options.page ?? 1,
    fields: SEARCH_FIELDS,
  });

  return Array.isArray(data?.docs)
    ? data.docs.map(normalizeSearchDoc)
    : [];
}

export async function getBooksByCategory(category, limit = 12) {
  const safeCategory = category.trim();

  if (!safeCategory) return [];

  const subject = safeCategory.replaceAll('"', "");

  const data = await requestJson("/search.json", {
    q: `subject:"${subject}"`,
    limit: Math.min(limit, 30),
    fields: SEARCH_FIELDS,
  });

  return Array.isArray(data?.docs)
    ? data.docs.map(normalizeSearchDoc)
    : [];
}

export async function getMixedBooks(limit = 30) {
  const data = await requestJson("/search.json", {
    q: HOME_QUERY,
    limit: Math.min(Math.max(limit, 24), 60),
    fields: SEARCH_FIELDS,
  });

  const seen = new Set();

  return (Array.isArray(data?.docs) ? data.docs : [])
    .map(normalizeSearchDoc)
    .filter((book) => {
      if (!book.id || seen.has(book.id)) {
        return false;
      }

      seen.add(book.id);
      return true;
    })
    .slice(0, limit);
}

export async function getEditionMetadata(id, limit = 5) {
  const workId = normalizeWorkId(id);

  if (!isValidWorkId(workId)) {
    return null;
  }

  try {
    const data = await requestJson(
      `/works/${encodeURIComponent(workId)}/editions.json`,
      {
        limit: Math.min(Math.max(limit, 1), 10),
        fields:
          "key,title,publish_date,publishers,languages,covers,isbn,number_of_pages,physical_format",
      }
    );

    const entries = Array.isArray(data?.entries)
      ? data.entries
      : [];

    const edition =
      entries.find(
        (entry) =>
          entry?.covers?.length ||
          entry?.languages?.length ||
          entry?.publishers?.length
      ) || entries[0];

    if (!edition) return null;

    const languages = Array.isArray(edition.languages)
      ? edition.languages
          .map((language) => {
            if (typeof language === "string") {
              return language.split("/").pop();
            }

            return language?.key
              ? language.key.split("/").pop()
              : language?.name || "";
          })
          .filter(Boolean)
      : [];

    return {
      coverIds: Array.isArray(edition.covers)
        ? edition.covers
        : [],
      languages,
      publishers: Array.isArray(edition.publishers)
        ? edition.publishers
        : [],
      publishDate: edition.publish_date || null,
      isbn: Array.isArray(edition.isbn)
        ? edition.isbn[0] || null
        : null,
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
  const workId = normalizeWorkId(id);

  if (!isValidWorkId(workId)) {
    throw new Error("Invalid book identifier.");
  }

  const data = await requestJson(
    `/works/${encodeURIComponent(workId)}.json`
  );

  const authors = Array.isArray(data?.authors)
    ? data.authors
        .map((author) => author?.author?.key || author?.key)
        .filter(Boolean)
        .map((key) => key.split("/").pop())
    : [];

  const subjects = [
    ...(Array.isArray(data?.subjects) ? data.subjects : []),
    ...(Array.isArray(data?.subject_people)
      ? data.subject_people
      : []),
    ...(Array.isArray(data?.subject_places)
      ? data.subject_places
      : []),
  ]
    .map(cleanText)
    .filter(Boolean)
    .slice(0, 20);

  return {
    id: workId,
    title: data.title || "Untitled book",
    description: cleanText(data.description),
    coverIds: Array.isArray(data.covers)
      ? data.covers
      : [],
    coverUrl: data.covers?.[0]
      ? createCoverUrl(data.covers[0], "L")
      : null,
    authors,
    subjects,
    firstPublishYear: data.first_publish_date || null,
    revision: data.revision || null,
    latestRevision: data.latest_revision || null,
    created: data.created?.value || null,
    openLibraryUrl: `${OPEN_LIBRARY_URL}/works/${workId}`,
  };
}

export function getReadingUrl(book) {
  if (!book) return null;

  const archiveId = Array.isArray(book.ia)
    ? book.ia.find(Boolean)
    : null;

  const canRead =
    book.ebookAccess === "public" ||
    book.ebookAccess === "borrow" ||
    book.hasFulltext;

  if (!archiveId || !canRead) {
    return null;
  }

  return `${ARCHIVE_URL}/details/${encodeURIComponent(archiveId)}`;
}

export {
  createCoverUrl as coverUrl,
  createEditionCoverUrl as coverEditionUrl,
};
