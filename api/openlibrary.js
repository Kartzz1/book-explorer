const OPEN_LIBRARY_ORIGIN = "https://openlibrary.org";
const MAX_CACHE_AGE = 300;
const STALE_WHILE_REVALIDATE = 600;

const ALLOWED_PATHS = [
  /^\/search\.json$/,
  /^\/works\/[A-Za-z0-9_-]+\.json$/,
  /^\/works\/[A-Za-z0-9_-]+\/editions\.json$/,
];

function isAllowedPath(path) {
  return ALLOWED_PATHS.some((pattern) => pattern.test(path));
}

function getQueryValue(value) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function buildOpenLibraryUrl(path, query) {
  const url = new URL(path, OPEN_LIBRARY_ORIGIN);

  for (const [key, value] of Object.entries(query)) {
    if (key === "path" || value == null) {
      continue;
    }

    const normalizedValue = getQueryValue(value);

    if (
      typeof normalizedValue === "string" &&
      normalizedValue.length > 0
    ) {
      url.searchParams.set(key, normalizedValue);
    }
  }

  return url;
}

function getUserAgent() {
  const contact = process.env.OPEN_LIBRARY_CONTACT;

  if (contact) {
    return `Book Explorer/1.0 (contact: ${contact})`;
  }

  return "Book Explorer/1.0 (Open Library catalog client)";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");

    return res.status(405).json({
      error: "Method not allowed.",
    });
  }

  const rawPath = Array.isArray(req.query?.path)
    ? req.query.path[0]
    : req.query?.path;

  const path = typeof rawPath === "string" ? rawPath : "";

  if (!isAllowedPath(path)) {
    return res.status(400).json({
      error: "Unsupported Open Library resource.",
    });
  }

  let openLibraryUrl;

  try {
    openLibraryUrl = buildOpenLibraryUrl(path, req.query || {});
  } catch (error) {
    console.error("Failed to construct Open Library URL:", error);

    return res.status(400).json({
      error: "Invalid Open Library request.",
    });
  }

  try {
    const response = await fetch(openLibraryUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": getUserAgent(),
      },
    });

    const body = await response.text();

    const contentType =
      response.headers.get("content-type") ||
      "application/json; charset=utf-8";

    res.setHeader("Content-Type", contentType);

    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${MAX_CACHE_AGE}, stale-while-revalidate=${STALE_WHILE_REVALIDATE}`
    );

    return res.status(response.status).send(body);
  } catch (error) {
    console.error("Open Library request failed:", error);

    return res.status(502).json({
      error: "Open Library is temporarily unavailable.",
    });
  }
}