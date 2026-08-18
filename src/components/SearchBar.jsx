import { ArrowUpRight, Search } from "lucide-react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search books, authors, or ideas...",
}) {
  const navigate = useNavigate();
  const [localValue, setLocalValue] = useState("");

  const isControlled = value !== undefined;
  const searchValue = isControlled ? value : localValue;

  function handleChange(event) {
    const nextValue = event.target.value;

    if (!isControlled) {
      setLocalValue(nextValue);
    }

    onChange?.(nextValue);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const query = searchValue.trim();

    if (!query) {
      return;
    }

    if (onSubmit) {
      onSubmit(query);
      return;
    }

    navigate(`/explore?q=${encodeURIComponent(query)}`);
  }

  return (
    <Form className="spatial-search" onSubmit={handleSubmit} role="search">
      <Search size={20} aria-hidden="true" />

      <Form.Control
        type="search"
        value={searchValue}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />

      <button
        className="search-submit"
        type="submit"
        aria-label="Search"
      >
        <ArrowUpRight size={18} aria-hidden="true" />
      </button>
    </Form>
  );
}
