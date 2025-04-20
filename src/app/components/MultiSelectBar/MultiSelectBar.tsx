"use client";
import { useState, useEffect } from "react";

interface MultiSelectProps {
  skills: string[];
  onSelect: (selectedSkills: string[]) => void; // Add the onSelect prop
}

const MultiSelect: React.FC<MultiSelectProps> = ({ skills, onSelect }) => {
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>(skills);

  // Update the parent with selected skills whenever it changes
  useEffect(() => {
    onSelect(selected);
  }, [selected, onSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setFiltered(
      skills.filter(
        (skill) =>
          skill.toLowerCase().includes(val.toLowerCase()) &&
          !selected.includes(skill)
      )
    );
  };

  const handleSelect = (value: string) => {
    if (!selected.includes(value)) {
      setSelected([...selected, value]);
      //console.log("Selected Skills (in MultiSelect):", [...selected, value]);
      setInputValue("");
      setFiltered(skills.filter((skill) => skill !== value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab") && inputValue) {
      e.preventDefault();
      const match = filtered[0];
      if (match) handleSelect(match);
    } else if (e.key === "Backspace" && !inputValue && selected.length > 0) {
      const last = selected[selected.length - 1];
      removeTag(last);
    }
  };

  const removeTag = (tag: string) => {
    setSelected(selected.filter((t) => t !== tag));
    if (!filtered.includes(tag)) setFiltered([...filtered, tag]);
  };

  return (
    <section className="w-full max-w-md">
      {/* Tag input area with fixed height */}
      <section className="border border-gray-600 bg-gray-800 p-2 rounded-lg h-16 overflow-y-auto">
        <section className="flex flex-wrap gap-2 w-full">
          {selected.map((item) => (
            <section
              key={item}
              className="flex items-center max-w-[48%] truncate bg-gray-700 text-white px-3 py-1 rounded-full hover:bg-gray-600 transition"
            >
              <em className="truncate">{item}</em>
              <button
                onClick={() => removeTag(item)}
                className="ml-2 text-gray-400 hover:text-red-400 font-bold"
              >
                ×
              </button>
            </section>
          ))}

          {/* Input field */}
          <section className="flex-grow w-full">
            <input
              type="text"
              className="bg-gray-800 text-white placeholder-gray-400 focus:outline-none px-2 py-1 w-full"
              placeholder="Filter skills..."
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </section>
        </section>
      </section>

      {/* Dropdown for filtering skills */}
      <ul className="mt-2 border border-gray-600 bg-gray-800 rounded-lg shadow-md max-h-40 overflow-auto">
        {inputValue && filtered.length > 0 ? (
          filtered.map((option) => (
            <li
              key={option}
              className="px-4 py-2 cursor-pointer hover:bg-gray-600 hover:text-white text-gray-300"
              onClick={() => handleSelect(option)}
            >
              {option}
            </li>
          ))
        ) : inputValue ? (
          <li className="px-4 py-2 text-gray-400 italic select-none">
            No results found
          </li>
        ) : null}
      </ul>
    </section>
  );
};

export default MultiSelect;
