import React from "react";

/*
--- NOTE ON USE ---

import Button, { Sizes } from "./components/button/Button"; 

example:

<Button 
  caption="Click Me" 
  onClick={() => console.log("Button clicked!")} 
  size={Sizes.Big} 
  style={{ backgroundColor: "#f87171" }} 


  You must pass the Button :
  - caption: string
  - function: () => void
  - style: 	React.CSSProperties	{OPTIONAL} ->custom inline styles (e.g., background color, width, etc.)
  - size: Sizes enum
/>


*/

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

/*
 BUTTON testing:
 <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Button Component Test</h1>

      <Button
        caption="Normal Button"
        onClick={() => console.log("Normal clicked")}
        size={Sizes.Normal}
      />

      <Button
        caption="Big Button"
        onClick={() => console.log("Big clicked")}
        size={Sizes.Big}
      />

      <Button
        caption="Bigger Button"
        onClick={() => console.log("Bigger clicked")}
        size={Sizes.Bigger}
      />

      <Button
        caption="Styled Button"
        onClick={() => console.log("Styled clicked")}
        size={Sizes.Bigger}
        style={{
          backgroundColor: "#fbbf24", // Tailwind amber-400
          color: "#1f2937", // Tailwind gray-800
          border: "2px solid #1f2937",
        }}
      />
    </main>
*/

export default Button;
