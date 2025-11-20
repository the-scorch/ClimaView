import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (input.length < 2) {
        setSuggestions([]);
        return;
      }

      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${input}&count=5`
      );
      const data = await res.json();
      setSuggestions(data.results || []);
      setSelectedIndex(-1); // reset selection on new input
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
      setInput("");
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (city) => {
    setInput(city.name);
    setSuggestions([]);
    onSearch(city.name);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black" />

          <input
            type="text"
            placeholder="Search city..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-black placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          Search
        </button>
      </form>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          {suggestions.map((city, index) => (
            <li
              key={city.id}
              onClick={() => handleSelect(city)}
              className={`px-4 py-2 cursor-pointer text-black rounded-2xl ${
                index === selectedIndex ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              {city.name}, {city.country}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
