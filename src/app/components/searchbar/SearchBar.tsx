import React from "react";

interface Props {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}

const SearchBar: React.FC<Props> = ({
  placeholder = "Search for projects",
  value,
  onChange,
  className = "",
  type = "text",
}) => {
  return (
    <input
  type={type}
  value={value}
  onChange={onChange}
  placeholder={placeholder}
  className={`box searchbar pl-8 pr-2 text-sm text-gray-200 placeholder-gray-500 bg-gray-700 border-0 rounded-md focus:shadow-outline-gray focus:placeholder-gray-600 focus:outline-none focus:shadow-outline-purple form-input ${className}`}
/>

  );
};

export default SearchBar;
