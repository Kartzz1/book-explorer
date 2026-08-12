import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import SpatialNavbar from "./components/SpatialNavbar";
import ScrollToTop from "./components/ScrollToTop";
import LoadingState from "./components/LoadingState";
import { useFavorites } from "./hooks/useFavorites";

const Home = lazy(() => import("./pages/Home"));
const Explore = lazy(() => import("./pages/Explore"));
const BookDetails = lazy(() => import("./pages/BookDetails"));
const Favorites = lazy(() => import("./pages/Favorites"));
const About = lazy(() => import("./pages/About"));

export default function App() {
  useFavorites();

  return (
    <div className="app-shell">
      <ScrollToTop />
      <SpatialNavbar />
      <main>
        <Suspense fallback={<LoadingState label="Opening the library..." />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/book/:id" element={<BookDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="container-fluid spatial-container">
          <span>Book Explorer</span>
          <span>Powered by Open Library</span>
        </div>
      </footer>
    </div>
  );
}