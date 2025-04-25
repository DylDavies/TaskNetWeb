import React from "react";
import "./inputBar.css";

interface InputBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  min?: number;
}

const InputBar: React.FC<InputBarProps> = ({
  placeholder = "Enter text...",
  value,
  onChange,
  className = "",
  type = "text",
  min,
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded px-4 py-2 input group  ${className}`}
      min={min}
    />
  );
};

export default InputBar;
