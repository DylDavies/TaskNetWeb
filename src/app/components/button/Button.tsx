import React from "react";
import "./Button.css";

export enum Sizes {
  Normal = "normal",
  Big = "big",
  Bigger = "bigger",
}

interface Props {
  caption?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  size?: Sizes;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

const sizeClasses = {
  [Sizes.Normal]: "text-sm py-2 px-4",
  [Sizes.Big]: "text-md py-3 px-6",
  [Sizes.Bigger]: "text-lg py-4 px-8",
};

const Button = ({
  caption,
  onClick,
  style,
  size = Sizes.Normal,
  disabled = false,
  icon,
  type = "button",
}: Props) => {
  const sizeClass = sizeClasses[size];

  return (
    <button
      role="button"
      onClick={onClick}
      className={`btn-grad rounded-full flex items-center justify-center ${sizeClass}`}
      style={style}
      disabled={disabled}
      type={type}
    >
      {icon && <em className={caption ? "mr-2" : ""}>{icon}</em>}
      {caption}
    </button>
  );
};

export default Button;
