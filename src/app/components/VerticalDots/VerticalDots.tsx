import { MoreVertical } from "lucide-react";

interface VerticalDotsProps {
  onClick: () => void;
  isVisible: boolean;
  caption: string;
}

const VerticalDots: React.FC<VerticalDotsProps> = ({
  onClick,
  isVisible,
  caption,
}) => {
  if (!isVisible) return null;

  return (
    <section className="relative group">
      <button onClick={onClick} className="p-2 cursor-pointer">
        <MoreVertical className="w-5 h-5" />
      </button>
      <em className="absolute -top-6 left-0 whitespace-nowrap text-xs px-2 py-1 bg-gray-700 text-white rounded opacity-0 group-hover:opacity-100 transition">
        {caption}
      </em>
    </section>
  );
};

export default VerticalDots;
