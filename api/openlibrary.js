const OPEN_LIBRARY_ORIGIN = "https://openlibrary.org";
const ALLOWED_MAX_AGE = 300;

function isAllowedPath(path) {
  if (path === "/search.json") return true;
  if (/^\/works\/[A-Za-z0-9_-]+\.json$/.test(path)) return true;
  return /^\/works\/[A-Za-z0-9_-]+\/editions\.json$/.test(path);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const rawPath = Array.isArray(req.query?.path) ? req.query.path[0] : req.query?.path;
  const path = typeof rawPath === "string" ? rawPath : "";

  if (!isAllowedPath(path)) {
    return res.status(400).json({ error: "Unsupported Open Library resource." });
  }

  const url = new URL(path, OPEN_LIBRARY_ORIGIN);
  for (const [key, value] of Object.entries(req.query || {})) {
    if (key === "path" || value == null) continue;
    const normalized = Array.isArray(value) ? value[0] : value;
    if (normalized !== "") url.searchParams.set(key, normalized);
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": process.env.OPEN_LIBRARY_CONTACT
          ? `Book Explorer/1.0 (contact: ${process.env.OPEN_LIBRARY_CONTACT})`
          : "Book Explorer/1.0 (Open Library catalog client)",
      },
    });

    const body = await response.text();
    const contentType = response.headers.get("content-type") || "application/json; charset=utf-8";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${ALLOWED_MAX_AGE}, stale-while-revalidate=600`
    );

    return res.status(response.status).send(body);
  } catch (error) {
    console.error("Open Library proxy error:", error);
    return res.status(502).json({ error: "Open Library is temporarily unavailable." });
  }
}
