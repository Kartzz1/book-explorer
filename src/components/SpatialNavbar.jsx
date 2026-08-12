import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import ThemeSwitcher from "./ThemeSwitcher";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/favorites", label: "Favorites" },
  { to: "/about", label: "About" },
];

export default function SpatialNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="spatial-nav-wrap">
      <nav className="spatial-navbar" aria-label="Primary navigation">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true"><BookOpen size={18} /></span>
          <span>Book Explorer</span>
        </NavLink>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className={`nav-links ${open ? "is-open" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}