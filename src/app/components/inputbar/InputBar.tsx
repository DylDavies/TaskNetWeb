import React from "react";

interface InputBarProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
}

const InputBar: React.FC<InputBarProps> = ({
  placeholder = "Enter text...",
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
      className={`border rounded px-4 py-2 input group  ${className}`}
    />
  );
};

export default InputBar;
