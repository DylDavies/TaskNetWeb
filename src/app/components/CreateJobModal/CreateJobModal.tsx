'use client';

import React, { useState } from "react";
import InputBar from "../inputbar/InputBar";
import Button from "../button/Button";
import "../button/Button.css";
import "../inputbar/inputBar.css";
import "./CreateJobModal.css";
import Modal from "react-modal";

const dummySkills = ["React", "Tailwind", "Node.js", "Figma", "TypeScript", "Vue", "JavaScript", "CSS"];

const CreateJobModal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [filteredSkills, setFilteredSkills] = useState<string[]>(dummySkills);

  const [modalIsOpen,setIsOpen]=useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Job created:", {
      title,
      description,
      status,
      deadline,
      budget: `${minBudget} - ${maxBudget}`,
      skills: selectedSkills,
    });

    // Reset fields
    setTitle("");
    setDescription("");
    setStatus("");
    setDeadline("");
    setMinBudget("");
    setMaxBudget("");
    setSelectedSkills([]);
    setSkillInput("");
  };

  const handleSkillSelect = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
      setSkillInput(""); 
      setFilteredSkills(dummySkills); 
    }
  };

  const handleSkillRemove = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };

  function openModal(){
    setIsOpen(true);
  }

  function closeModal(){
    setIsOpen(false);
  }



  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);

    // Filter skills based on input
    const filtered = dummySkills.filter((skill) =>
      skill.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSkills(filtered);
  };

  return (
    <section>
      <button onClick={openModal}> Open </button>
    <Modal isOpen={modalIsOpen} 
    onRequestClose={closeModal}>
    <section className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
        <section className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create a New Job</h2>
          <button
            onClick={closeModal} 
            className="text-white text-xl hover:text-red-400"
          >
            ×
          </button>
        </section>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <InputBar
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job Title"
            type="text"
          />

          {/* Description */}
          <textarea
  placeholder="Job Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  className="job-description"
  rows={4}
  style={{
    width: '100%',
    minHeight: '150px',
    boxShadow: '0 0 0 1.5px #2b2c37, 0 0 25px -17px #000',
    border: '0',
    borderRadius: '12px',
    backgroundColor: '#26272c',
    outline: 'none',
    color: 'white',
    padding: '12px',
    transition: 'all 0.25s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: 'text',
  }}
/>



          {/* Budget */}
          <section className="flex items-center gap-2 mb-2">
            <label className="text-sm font-medium">Budget</label>
            <section className="flex gap-2">
              <input
                value={minBudget}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || parseFloat(value) >= 0) {
                    setMinBudget(value);
                  }
                }}
                placeholder="Min"
                type="number"
                className="input"
                style={{ width: "120px", paddingLeft: "12px" }}

                
              />
              <input
                value={maxBudget}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value || parseFloat(value) >= 0) {
                    setMaxBudget(value);
                  }
                }}
                placeholder="Max"
                type="number"
                className="input"
                style={{ width: "120px", paddingLeft: "12px" }}
              />
            </section>
          </section>

          {/* Deadline */}
          <InputBar
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Deadline"
            type="date"
          />

          {/* Status */}
          <InputBar
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="Status"
            type="text"
          />

          {/* Skills */}
          <section>
            <section className="flex flex-wrap gap-2 mb-2">
              <InputBar
                value={skillInput}
                onChange={handleSkillInputChange}
                placeholder="Skills"
                type="text"
              />
            </section>

            {/* Skill suggestions (autocomplete) */}
            {skillInput && filteredSkills.length > 0 && (
              <section className="border border-gray-300 rounded-xl bg-neutral-700 text-gray-300 p-2">
                {filteredSkills.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillSelect(skill)}
                    className="w-full text-left p-2 hover:bg-neutral-600 rounded"
                  >
                    {skill}
                  </button>
                ))}
              </section>
            )}

            {/* Pills */}
            <section className="flex flex-wrap gap-2 mt-2">
              {selectedSkills.map((skill) => (
                <section
                  key={skill}
                  className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove(skill)}
                    className="text-white hover:text-red-300"
                  >
                    ×
                  </button>
                </section>
              ))}
            </section>
          </section>

          <section className="flex justify-end">
            <Button caption={"Submit"} />
          </section>
        </form>
      </article>
    </section>
    </Modal>
    </section>
  );
};

export default CreateJobModal;
