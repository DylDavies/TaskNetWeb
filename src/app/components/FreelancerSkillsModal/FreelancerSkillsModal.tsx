import React, { useState, useEffect, useContext } from "react";
import MultiSelect from "../MultiSelectBar/MultiSelectBar";
import {
  getAllSkills,
  mapSkillsToAreas,
} from "@/app/server/services/SkillsService";
import SkillAreaFilterPills from "../SkillAreaPills/SkillAreaPills";
import FreelancerSkillList from "../FreelancerSkillList/FreelancerSkillList";
import toast from "react-hot-toast";
import {
  addSkillsToFreelancer,
  removeSkillFromFreelancer,
} from "@/app/server/services/DatabaseService";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import Image from "next/image";
import "./FreelancerSkillsModal.css";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";

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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmGoBackOpen, setConfirmGoBackOpen] = useState(false);

  const { user } = useContext(AuthContext) as AuthContextType;

  // fetch Skills for multi-select(only allow skills that user doesnt have)
  useEffect(() => {
    async function fetchSkills() {
      try {
        const skillData = await getAllSkills(); // all possible skills
        const userSkillsFlat = getAllUserSkillsFlat(userSkills); // current user's skills
        const filteredSkills = skillData.filter(
          (skill) => !userSkillsFlat.includes(skill)
        );
        setAvailableSkills(filteredSkills);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    }
    fetchSkills();
  }, [userSkills]);

  // helper to flatten skills
  const getAllUserSkillsFlat = (skillsMap: { [area: string]: string[] }) => {
    return Object.values(skillsMap).flat();
  };

  //Validates that a freelancer has selected a skill and then adds that skill if they have
  const confirmSkillSave = async () => {
    if (selectedSkills.length === 0) {
      toast.error("Please ensure that you have selected skills");
      return;
    }

    const skillAreaSkillMap = await mapSkillsToAreas(selectedSkills);

    if (Object.keys(skillAreaSkillMap).length === 0) {
      toast.error("Please select at least one skill");
      return;
    }

    await addSkillsToFreelancer(user!.authUser.uid, skillAreaSkillMap);
    toast.success("Successfully added skills to your profile");

    if (selectedArea) {
      const updated = {
        ...tempSkills,
        [selectedArea]: selectedSkills,
      };
      setTempSkills(updated);
      onUpdateSkills(updated);
    }

    setModalView("display");
    setConfirmSaveOpen(false);
  };

  // Remove a skill
  const handleRemoveSkill = async (skillToRemove: string) => {
    setSkillToDelete(skillToRemove);
    setConfirmOpen(true);
  };

  //Confirming a skills has been deleted and updating the necesary functions
  const confirmSkillDelete = async () => {
    if (!user || !skillToDelete) return;
    try {
      await removeSkillFromFreelancer(user.authUser.uid, skillToDelete);
      toast.success(`Removed skill: ${skillToDelete}`);

      const updated = { ...tempSkills };
      Object.keys(updated).forEach((area) => {
        updated[area] = updated[area].filter((s) => s !== skillToDelete);
        if (updated[area].length === 0) delete updated[area];
      });
      setTempSkills(updated);
      onUpdateSkills(updated);
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove skill");
    } finally {
      setConfirmOpen(false);
      setSkillToDelete(null);
    }
  };

  //Cancels deleting a skill if it was an accident
  const cancelSkillDelete = () => {
    setConfirmOpen(false);
    setSkillToDelete(null);
  };

  //Hadles the area of skills that was selected
  const handleAreaSelect = (area: string | null) => {
    if (area !== selectedArea) {
      setSelectedArea(area);
      setSelectedSkills([]);
    }
  };

  // Handle the Back Button Click
  const handleBackButtonClick = () => {
    if (modalView === "edit") {
      setConfirmGoBackOpen(true);
    } else {
      onClose();
    }
  };

  // Handle the confirmation of going back
  const confirmGoBack = () => {
    setModalView("display");
    setConfirmGoBackOpen(false);
  };

  // Handle canceling the back action
  const cancelGoBack = () => {
    setConfirmGoBackOpen(false);
  };

  if (!show) return null;

  return (
    <section className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center niceScrollBar">
      <section className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col">
        <section className="flex justify-between items-center border-b border-gray-700 px-6 py-4">
          <button
            onClick={handleBackButtonClick}
            className="text-gray-400 hover:text-white text-xl"
          >
            <Image
              src="/images/backArrow.png"
              alt="Delete"
              width={25}
              height={25}
              className="icons"
            />
          </button>
          <h2 className="text-xl font-semibold">Skills</h2>
          {modalView === "display" ? (
            <button
              onClick={() => setModalView("edit")}
              className="text-gray-400 hover:text-white text-xl"
            >
              <Image
                src="/images/addIcon.png"
                alt="Delete"
                width={25}
                height={25}
                className="icons"
              />
            </button>
          ) : (
            <em className="w-6" />
          )}
        </section>

        <section className="flex-grow px-6 overflow-y-auto py-4">
          {modalView === "display" ? (
            <>
              <SkillAreaFilterPills
                areas={Object.keys(userSkills || {})}
                selectedArea={selectedArea}
                onSelect={handleAreaSelect}
              />
              <section>
                <FreelancerSkillList
                  skills={
                    selectedArea === null
                      ? Object.values(userSkills).flat()
                      : userSkills[selectedArea] || []
                  }
                  onRemoveSkill={handleRemoveSkill}
                />
              </section>
            </>
          ) : (
            <section className="container-multi-select">
              <section className="multi-select-wrapper">
                <MultiSelect
                  skills={availableSkills}
                  onSelect={setSelectedSkills}
                />
              </section>
            </section>
          )}
        </section>

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

        {modalView === "edit" && (
          <section className="px-6 py-4 border-t border-gray-700">
            <button
              onClick={() => setConfirmSaveOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition icons"
            >
              Save
            </button>
          </section>
        )}
      </section>
      {/* Confirm remove */}
      <ConfirmationModal
        modalIsOpen={confirmOpen}
        onClose={cancelSkillDelete}
        onConfirm={confirmSkillDelete}
        onDeny={cancelSkillDelete}
        message={`Are you sure you want to remove "${skillToDelete}" from your skills?`}
      />

      {/* Confirm save */}
      <ConfirmationModal
        modalIsOpen={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={confirmSkillSave}
        onDeny={() => setConfirmSaveOpen(false)}
        message={`Are you sure you want to save the selected skills? 
    ${
      selectedSkills.length > 0
        ? selectedSkills.join(", ")
        : "No skills selected."
    }`}
      />

      {/* Confirmation going back */}
      <ConfirmationModal
        modalIsOpen={confirmGoBackOpen}
        onClose={cancelGoBack}
        onConfirm={confirmGoBack}
        onDeny={cancelGoBack}
        message="Are you sure you want to go back? All progress will be deleted."
      />
    </section>
  );
};

export default FreelancerSkillsModal;
