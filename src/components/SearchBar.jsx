import { ArrowUpRight, Search } from "lucide-react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function SearchBar({ value, onChange, onSubmit, placeholder = "Search books, authors, or ideas..." }) {
  const navigate = useNavigate();
  const [localValue, setLocalValue] = useState(value ?? "");

  const controlled = value !== undefined;
  const currentValue = controlled ? value : localValue;

  function update(next) {
    if (!controlled) setLocalValue(next);
    onChange?.(next);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = currentValue.trim();
    if (!trimmed) return;

    if (onSubmit) {
      onSubmit(trimmed);
    } else {
      navigate(`/explore?q=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <Form className="spatial-search" onSubmit={handleSubmit} role="search">
      <Search size={20} aria-hidden="true" />
      <Form.Control
        type="search"
        value={currentValue}
        onChange={(event) => update(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <button className="search-submit" type="submit" aria-label="Search">
        <ArrowUpRight size={18} />
      </button>
    </Form>
  );
}