import { ArrowLeft, BookOpen, CalendarDays, Globe2, Layers3, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import BookCover from "../components/BookCover";
import FavoriteButton from "../components/FavoriteButton";
import OpenLibraryButton from "../components/OpenLibraryButton";
import ReadBookButton from "../components/ReadBookButton";
import LoadingState from "../components/LoadingState";
import ErrorState from "../components/ErrorState";

import {
  getBookDetails,
  getEditionMetadata,
  searchBooks,
} from "../services/openLibraryApi";

import {
  getAuthorLabel,
  getDescription,
  getLanguageLabel,
  getYearLabel,
} from "../utils/bookHelpers";


function createBookModel(details, searchRecord) {
  const coverId = details.edition?.coverIds?.[0];

  return {
    id: details.id,
    title: details.title,
    description: details.description,

    // Prefer edition covers because they usually provide higher quality images.
    coverUrl: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
      : details.coverUrl,

    coverLargeUrl: coverId
      ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      : details.coverUrl,

    authors:
      searchRecord?.authors?.length
        ? searchRecord.authors
        : details.authors || [],

    firstPublishYear:
      searchRecord?.firstPublishYear ||
      details.firstPublishYear ||
      details.edition?.publishDate,

    subjects: details.subjects || [],

    editionCount: searchRecord?.editionCount || 0,

    languages:
      details.edition?.languages ||
      searchRecord?.languages ||
      [],

    publisher:
      details.edition?.publishers?.[0] ||
      searchRecord?.publisher ||
      null,

    numberOfPages:
      details.edition?.numberOfPages || null,

    physicalFormat:
      details.edition?.physicalFormat || null,

    openLibraryUrl: details.openLibraryUrl,
  };
}


export default function BookDetails() {
  const { id } = useParams();

  const [details, setDetails] = useState(null);
  const [searchRecord, setSearchRecord] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    let ignore = false;

    async function fetchBook() {
      setLoading(true);
      setError("");

      try {
        const [
          bookDetails,
          searchResults,
          editionData,
        ] = await Promise.all([
          getBookDetails(id),
          searchBooks(`key:${id}`, { limit: 1 }).catch(() => []),
          getEditionMetadata(id).catch(() => null),
        ]);


        if (ignore) return;

        setDetails({
          ...bookDetails,
          edition: editionData,
        });

        setSearchRecord(searchResults[0] || null);

      } catch (err) {
        console.error("Failed loading book details:", err);

        if (!ignore) {
          setError(
            "This book could not be loaded from Open Library."
          );
        }

      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }


    fetchBook();

    // Prevents state updates after leaving the page.
    return () => {
      ignore = true;
    };

  }, [id]);


  const book = useMemo(() => {
    if (!details) return null;

    return createBookModel(
      details,
      searchRecord
    );

  }, [details, searchRecord]);


  if (loading) {
    return (
      <div className="page-shell">
        <LoadingState label="Opening the book..." />
      </div>
    );
  }


  if (!book || error) {
    return (
      <div className="page-shell">
        <div className="container-fluid spatial-container">

          <ErrorState
            message={
              error ||
              "The requested book does not exist."
            }
          />

          <Link
            className="text-link"
            to="/explore"
          >
            <ArrowLeft size={16}/>
            Return to Explore
          </Link>

        </div>
      </div>
    );
  }


  const facts = [
    {
      icon: CalendarDays,
      label: "First publication",
      value: getYearLabel(book.firstPublishYear),
    },
    {
      icon: Layers3,
      label: "Edition count",
      value: book.editionCount || "Unavailable",
    },
    {
      icon: Globe2,
      label: "Language",
      value: getLanguageLabel(book.languages),
    },
    {
      icon: BookOpen,
      label: "Publisher",
      value: book.publisher || "Unavailable",
    },
  ];


  return (
    <div className="page-shell details-page">

      <div className="container-fluid spatial-container">

        <Link
          className="back-link"
          to="/explore"
        >
          <ArrowLeft size={16}/>
          Back to Explore
        </Link>


        <section className="book-detail-layout">

          <div className="detail-cover-stage">
            <div className="detail-cover">
              <BookCover
                book={book}
                priority
              />
            </div>
          </div>


          <div className="detail-copy">

            <span className="eyebrow">
              Book details
            </span>

            <h1>
              {book.title}
            </h1>


            <p className="detail-author">
              {getAuthorLabel(book)}
            </p>


            <div className="detail-actions">
              <FavoriteButton book={book}/>
              <ReadBookButton book={book}/>
              <OpenLibraryButton book={book}/>
            </div>


            <div className="detail-description">
              <p>
                {getDescription(book)}
              </p>
            </div>


            <div className="detail-facts">

              {facts.map(({icon: Icon, label, value}) => (
                <div key={label}>
                  <Icon size={17}/>

                  <span>
                    <strong>
                      {label}
                    </strong>

                    {value}
                  </span>
                </div>
              ))}

            </div>


            {book.subjects.length > 0 && (
              <div className="subject-list">

                <div className="subject-heading">
                  <Tag size={16}/>
                  Subjects
                </div>


                <div className="subject-tags">
                  {book.subjects
                    .slice(0,12)
                    .map(subject => (
                      <span key={subject}>
                        {subject}
                      </span>
                    ))}
                </div>

              </div>
            )}

          </div>

        </section>

      </div>

    </div>
  );
}
