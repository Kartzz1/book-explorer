import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);

  // Reset scroll position when navigating between pages
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);

  // Detect page scrolling
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`scroll-top-button ${
        showButton ? "scroll-top-button--visible" : ""
      }`}
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
    >
      <svg
        className="scroll-top-icon"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M6 14L12 8L18 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}