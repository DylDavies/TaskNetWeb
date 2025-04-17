import { useState } from "react";

interface MultiSelectProps {
  skills: string[];
}

const MultiSelect: React.FC<MultiSelectProps> = ({ skills }) => {
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>(skills); // use passed-in options

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
    <section className="w-full max-w-xl">
      <div className="border border-gray-600 bg-gray-800 p-2 rounded-lg flex flex-wrap items-start gap-2 h-24 overflow-y-auto">
        {selected.map((item) => (
          <div
            key={item}
            className="flex items-center bg-gray-700 text-white px-3 py-1 rounded-full hover:bg-gray-600 transition"
          >
            {item}
            <button
              onClick={() => removeTag(item)}
              className="ml-2 text-gray-400 hover:text-red-400 font-bold"
            >
              ×
            </button>
          </div>
        ))}
        <input
          type="text"
          className="bg-gray-800 text-white placeholder-gray-400 focus:outline-none px-2 py-1 min-w-[100px] flex-1"
          placeholder="Type to search..."
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Dropdown */}
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
