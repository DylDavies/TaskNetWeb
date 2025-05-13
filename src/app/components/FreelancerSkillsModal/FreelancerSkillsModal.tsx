import React, { useState, useEffect } from "react";
import MultiSelect from "../MultiSelectBar/MultiSelectBar";
import { getAllSkills } from "@/app/server/services/SkillsService";
import SkillAreaFilterPills from "../SkillAreaPills/SkillAreaPills";
import FreelancerSkillList from "../FreelancerSkillList/FreelancerSkillList";

interface SkillsModalProps {
  show: boolean;
  onClose: () => void;
  userSkills: { [skillArea: string]: string[] };
  onUpdateSkills: (updated: { [skillArea: string]: string[] }) => void;
}

const FreelancerSkillsModal: React.FC<SkillsModalProps> = ({
  show,
  onClose,
  userSkills,
  onUpdateSkills,
}) => {
  const [modalView, setModalView] = useState<"display" | "edit">("display");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [tempSkills, setTempSkills] = useState(userSkills || {});
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSkills() {
      try {
        const skillData = await getAllSkills();
        setAvailableSkills(skillData);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    }
    fetchSkills();
  }, []);

  const handleSave = () => {
    if (selectedArea) {
      const updated = {
        ...tempSkills,
        [selectedArea]: selectedSkills,
      };
      setTempSkills(updated);
      onUpdateSkills(updated);
    }
    setModalView("display");
  };

  const handleAreaSelect = (area: string | null) => {
    if (area !== selectedArea) {
      setSelectedArea(area);
      setSelectedSkills([]);
    }
  };

  if (!show) return null;

  return (
    <section className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <section className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
        {/* Header */}
        <section className="flex justify-between items-center border-b border-gray-700 px-6 py-4">
          <button
            onClick={() =>
              modalView === "edit" ? setModalView("display") : onClose()
            }
            className="text-gray-400 hover:text-white text-xl"
          >
            ←
          </button>
          <h2 className="text-xl font-semibold">Skills</h2>
          {modalView === "display" ? (
            <button
              onClick={() => setModalView("edit")}
              className="text-gray-400 hover:text-white text-xl"
            >
              +
            </button>
          ) : (
            <span className="w-6" />
          )}
        </section>

        {/* Scrollable Content */}
        <section className="flex-grow overflow-y-auto px-6 py-4">
          {modalView === "display" ? (
            <>
              <SkillAreaFilterPills
                areas={Object.keys(userSkills || {})}
                selectedArea={selectedArea}
                onSelect={handleAreaSelect}
              />
              <FreelancerSkillList
                skills={selectedArea ? userSkills[selectedArea] : []}
                area={selectedArea}
              />
            </>
          ) : (
            <MultiSelect
              skills={availableSkills}
              onSelect={setSelectedSkills}
            />
          )}
        </section>

        {/* Selected Skills List */}
        {modalView === "edit" && (
          <section className="px-6 pt-2 pb-3 bg-gray-800 border-t border-gray-700">
            <p className="text-sm text-gray-300 mb-2">
              <em>Selected Skills:</em>
            </p>
            {selectedSkills.length === 0 ? (
              <p className="text-gray-500 italic">No skills selected.</p>
            ) : (
              <ul
                className="space-y-1 list-disc list-inside max-h-36 overflow-y-auto"
                style={{ maxHeight: "150px" }}
              >
                {selectedSkills.map((skill, idx) => (
                  <li key={idx} className="text-white">
                    {skill}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Footer */}
        {modalView === "edit" && (
          <section className="px-6 py-4 border-t border-gray-700">
            <button
              onClick={handleSave}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition"
            >
              Save
            </button>
          </section>
        )}
      </section>
    </section>
  );
};

export default FreelancerSkillsModal;
