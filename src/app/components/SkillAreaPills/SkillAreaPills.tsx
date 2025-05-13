interface SkillAreaFilterPillsProps {
  areas: string[];
  selectedArea: string | null;
  onSelect: (area: string | null) => void;
}

const SkillAreaFilterPills: React.FC<SkillAreaFilterPillsProps> = ({
  areas,
  selectedArea,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Always-visible 'All' pill */}
      <button
        key="all"
        className={`px-3 py-1 rounded-full text-sm ${
          selectedArea === null ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onSelect(null)}
      >
        All
      </button>

      {/* Dynamic area pills */}
      {areas.map((area) => (
        <button
          key={area}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedArea === area ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => onSelect(area)}
        >
          {area}
        </button>
      ))}
    </div>
  );
};

export default SkillAreaFilterPills;
