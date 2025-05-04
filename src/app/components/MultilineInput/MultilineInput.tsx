import React, { useRef, useEffect } from "react";
import "./MultilineInput.css";

interface MultilineInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
}

const MultilineInput: React.FC<MultilineInputProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
  className = "",
  onKeyDown,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  const handleInput = () => {
    const content = ref.current?.textContent || "";
    onChange(content);
  };

  return (
    <section
      ref={ref}
      contentEditable
      className={`editable-input ${className}`}
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={onKeyDown}
      spellCheck={false}
    />
  );
};

export default MultilineInput;
