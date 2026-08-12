import { ArrowLeft, BookOpen, CalendarDays, Globe2, Layers3, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookCover from "../components/BookCover";
import FavoriteButton from "../components/FavoriteButton";
import OpenLibraryButton from "../components/OpenLibraryButton";
import ReadBookButton from "../components/ReadBookButton";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";
import { getBookDetails, getEditionMetadata, searchBooks } from "../services/openLibraryApi";
import { getAuthorLabel, getDescription, getYearLabel } from "../utils/bookHelpers";

export default function BookDetails() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [searchRecord, setSearchRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [detailResult, searchResult, editionResult] = await Promise.all([
          getBookDetails(id),
          searchBooks(`key:${id}`, { limit: 1 }).catch(() => []),
          getEditionMetadata(id).catch(() => null),
        ]);

        if (!active) return;

        setDetails({ ...detailResult, edition: editionResult });
        setSearchRecord(searchResult[0] || null);
      } catch (requestError) {
        console.error(requestError);
        if (active) setError("This book could not be opened from the Open Library catalog.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [id]);

  const book = useMemo(() => {
    if (!details) return null;

    return {
      id: details.id,
      title: details.title,
      description: details.description,
      coverUrl: details.edition?.coverIds?.[0]
        ? `https://covers.openlibrary.org/b/id/${details.edition.coverIds[0]}-M.jpg`
        : details.coverUrl,
      coverLargeUrl: details.edition?.coverIds?.[0]
        ? `https://covers.openlibrary.org/b/id/${details.edition.coverIds[0]}-L.jpg`
        : details.coverUrl,
      authors: searchRecord?.authors?.length
        ? searchRecord.authors
        : details.authors?.length
          ? details.authors.map((author) => author.replace(/^OL/, "Author "))
          : [],
      firstPublishYear: searchRecord?.firstPublishYear || details.firstPublishYear || details.edition?.publishDate || null,
      subjects: details.subjects,
      editionCount: searchRecord?.editionCount || 0,
      languages: details.edition?.languages?.length ? details.edition.languages : (searchRecord?.languages || []),
      publisher: details.edition?.publishers?.[0] || searchRecord?.publisher || null,
      isbn: details.edition?.isbn || searchRecord?.isbn || null,
      numberOfPages: details.edition?.numberOfPages || null,
      physicalFormat: details.edition?.physicalFormat || null,
      ebookAccess: searchRecord?.ebookAccess || null,
      hasFulltext: searchRecord?.hasFulltext || false,
      ia: searchRecord?.ia || [],
      openLibraryUrl: details.openLibraryUrl,
    };
  }, [details, searchRecord]);

  if (loading) {
    return <div className="page-shell"><LoadingState label="Opening the book..." /></div>;
  }

  if (error || !book) {
    return (
      <div className="page-shell">
        <div className="container-fluid spatial-container">
          <ErrorState message={error || "The requested book does not exist."} />
          <Link className="text-link" to="/explore">← Return to Explore</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell details-page">
      <div className="container-fluid spatial-container">
        <Link className="back-link" to="/explore"><ArrowLeft size={16} /> Back to Explore</Link>

        <section className="book-detail-layout">
          <div className="detail-cover-stage">
            <div className="detail-cover">
              <BookCover book={book} priority />
            </div>
          </div>

          <div className="detail-copy">
            <span className="eyebrow">Book details</span>
            <h1>{book.title}</h1>
            <p className="detail-author">{getAuthorLabel(book)}</p>

            <div className="detail-actions">
              <FavoriteButton book={book} />
              <ReadBookButton book={book} />
              <OpenLibraryButton book={book} />
            </div>

            <div className="detail-description">
              <p>{getDescription(book)}</p>
            </div>

            <div className="detail-facts">
              <div><CalendarDays size={17} /><span><strong>First publication</strong>{getYearLabel(book.firstPublishYear)}</span></div>
              <div><Layers3 size={17} /><span><strong>Edition count</strong>{book.editionCount || "Unavailable"}</span></div>
              <div><Globe2 size={17} /><span><strong>Language</strong>{book.languages?.length ? book.languages.slice(0, 4).map((language) => String(language).split("/").pop()).join(", ") : "Unavailable"}</span></div>
              <div><BookOpen size={17} /><span><strong>Publisher</strong>{book.publisher || "Unavailable"}</span></div>
              <div><BookOpen size={17} /><span><strong>Pages</strong>{book.numberOfPages || "Unavailable"}</span></div>
              <div><Layers3 size={17} /><span><strong>Format</strong>{book.physicalFormat || "Unavailable"}</span></div>
            </div>

            {book.subjects?.length ? (
              <div className="subject-list">
                <div className="subject-heading"><Tag size={16} /> Subjects</div>
                <div className="subject-tags">
                  {book.subjects.slice(0, 12).map((subject) => <span key={subject}>{subject}</span>)}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}