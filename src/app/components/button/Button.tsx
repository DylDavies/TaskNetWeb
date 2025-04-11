import React from "react";

export enum Sizes {
  Normal = "normal",
  Big = "big",
  Bigger = "bigger",
}

interface Props {
  caption: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  size?: Sizes;
}

const sizeClasses = {
  [Sizes.Normal]: "text-sm py-2 px-4",
  [Sizes.Big]: "text-md py-3 px-6",
  [Sizes.Bigger]: "text-lg py-4 px-8",
};

// Step 4: Use the enum + classes
const Button = ({ caption, onClick, style, size = Sizes.Normal }: Props) => {
  const sizeClass = sizeClasses[size];

  return (
    <button
      role="button"
      onClick={onClick}
      className={`btn-grad rounded-full  ${sizeClass}`}
      style={style}
    >
      {caption}
    </button>
  );
};

export default Button;
