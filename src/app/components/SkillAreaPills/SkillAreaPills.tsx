import React from "react";
import "./SkillAreaPills.css";

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
    <section className="skill-pills-container">
      {/* Default all pill*/}
      <button
        key="all"
        className={`skill-pill all-pill ${
          selectedArea === null ? "selected" : ""
        }`}
        onClick={() => onSelect(null)}
      >
        All
      </button>

      {/* Skill Area pills*/}
      {areas.map((area) => (
        <button
          key={area}
          className={`skill-pill ${selectedArea === area ? "selected" : ""}`}
          onClick={() => onSelect(area)}
        >
          {area}
        </button>
      ))}
    </section>
  );
};

export default SkillAreaFilterPills;
