import { ArrowUpRight, BookOpen, Compass, Heart, Layers3, Search } from "lucide-react";

const principles = [
  {
    icon: Search,
    title: "Search without friction",
    text: "Look up a title, author, subject, or idea and move directly from a question to a real catalog result.",
  },
  {
    icon: Compass,
    title: "Explore by instinct",
    text: "Curated shelves and mixed collections make room for the unexpected instead of forcing every discovery into a list.",
  },
  {
    icon: Heart,
    title: "Keep what matters",
    text: "Save books locally and build a personal shelf you can return to without creating an account.",
  },
];

export default function About() {
  return (
    <div className="page-shell about-page">
      <div className="container-fluid spatial-container">
        <section className="about-hero">
          <span className="eyebrow"><BookOpen size={14} /> About Book Explorer</span>
          <h1>A library designed for curiosity.</h1>
          <p>
            Book Explorer is a spatial reading-discovery experience that turns the Open Library catalog
            into a calmer place to browse. It is built for the moment before a reader knows exactly what
            they want — when a title, subject, or unexpected cover is enough to start looking.
          </p>
        </section>

        <section className="about-introduction">
          <div className="about-section-label">
            <span className="eyebrow"><Layers3 size={14} /> What is Book Explorer?</span>
          </div>
          <div className="about-introduction-copy">
            <h2>Books are more than records.</h2>
            <p>
              Traditional search interfaces are excellent at returning information, but discovery can feel
              like work. Book Explorer gives books a little more room: covers become visual anchors, shelves
              become pathways, and details appear when a reader chooses to look closer.
            </p>
            <p>
              The result is a digital library that combines real catalog data with an editorial, spatial
              interface — quiet enough to focus, expressive enough to invite exploration.
            </p>
          </div>
        </section>

        <section className="about-principles" aria-labelledby="about-principles-title">
          <div className="about-section-heading">
            <span className="eyebrow">Built around the reader</span>
            <h2 id="about-principles-title">Three simple ways in.</h2>
          </div>
          <div className="about-principles-grid">
            {principles.map(({ icon: Icon, title, text }) => (
              <article className="about-principle" key={title}>
                <span className="about-icon"><Icon size={19} aria-hidden="true" /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-source">
          <div>
            <span className="eyebrow">The catalog</span>
            <h2>Powered by Open Library, shaped for discovery.</h2>
          </div>
          <div>
            <p>
              Book Explorer requests live bibliographic information from Open Library, including titles,
              authors, covers, subjects, publication details, and reading availability when the catalog
              provides it. Missing information is left missing rather than invented.
            </p>
            <a className="primary-action" href="https://openlibrary.org/" target="_blank" rel="noopener noreferrer">
              Visit Open Library <ArrowUpRight size={16} />
            </a>
          </div>
        </section>

        <section className="about-closing">
          <span className="eyebrow">The experience</span>
          <h2>Search. Wander. Save a few. Come back later.</h2>
          <p>
            There is no perfect way to find the next book. Book Explorer is built around that uncertainty —
            giving the catalog enough structure to be useful while leaving enough space for discovery.
          </p>
        </section>
      </div>
    </div>
  );
}
