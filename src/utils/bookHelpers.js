export function getAuthorLabel(book) {
  if (Array.isArray(book?.authors) && book.authors.length) {
    return book.authors.join(", ");
  }

  if (Array.isArray(book?.author_name) && book.author_name.length) {
    return book.author_name.join(", ");
  }

  return "Author unavailable";
}

export function getYearLabel(value) {
  if (!value) return "Year unavailable";
  const match = String(value).match(/\b\d{4}\b/);
  return match ? match[0] : String(value);
}

export function getDescription(book) {
  if (!book?.description) return "No description is available for this work.";
  return book.description;
}

export function getBookCover(book) {
  return book?.coverUrl || book?.coverLargeUrl || null;
}

export function getOpenLibraryUrl(book) {
  if (book?.openLibraryUrl) return book.openLibraryUrl;
  if (book?.id) return `https://openlibrary.org/works/${book.id}`;
  return null;
}

export function formatSubjects(subjects = []) {
  return subjects.filter(Boolean).slice(0, 12);
}
const LANGUAGE_NAMES = {
  eng: "English", spa: "Spanish", fre: "French", fra: "French", ger: "German", deu: "German",
  ita: "Italian", por: "Portuguese", rus: "Russian", jpn: "Japanese", kor: "Korean",
  chi: "Chinese", zho: "Chinese", ara: "Arabic", hin: "Hindi", dut: "Dutch", nld: "Dutch",
  swe: "Swedish", dan: "Danish", nor: "Norwegian", fin: "Finnish", pol: "Polish",
  tur: "Turkish", lat: "Latin", grc: "Ancient Greek", heb: "Hebrew", und: "Unknown"
};

export function getLanguageLabel(languages = []) {
  if (!Array.isArray(languages) || !languages.length) return "Language unavailable";
  return languages
    .map((language) => LANGUAGE_NAMES[String(language).toLowerCase()] || String(language).toUpperCase())
    .slice(0, 2)
    .join(", ");
}
