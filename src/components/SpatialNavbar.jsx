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

  // Toggle the mobile navigation menu.
  function handleMenuToggle() {
    setOpen((current) => !current);
  }

  // Close the mobile menu after navigation.
  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="spatial-nav-wrap">
      <nav className="spatial-navbar" aria-label="Primary navigation">
        <NavLink to="/" className="brand" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            <BookOpen size={18} />
          </span>

          <span>Book Explorer</span>
        </NavLink>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={handleMenuToggle}
        >
          {open ? (
            <X size={20} aria-hidden="true" />
          ) : (
            <Menu size={20} aria-hidden="true" />
          )}
        </button>

        <div
          id="primary-navigation"
          className={`nav-links${open ? " is-open" : ""}`}
        >
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
              onClick={closeMenu}
            >
              {label}
            </NavLink>
          ))}

          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  );
}
