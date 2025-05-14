"use client";

import React, { useState, useEffect, useContext, ChangeEvent } from "react";
import InputBar from "../inputbar/InputBar";
import Button from "../button/Button";
import "../button/Button.css";
import "../inputbar/inputBar.css";
import "./CreateJobModal.css";
import Modal from "react-modal";
import {
  getAllSkills,
  mapSkillsToAreas,
} from "@/app/server/services/SkillsService";
import formatDateAsNumber from "@/app/server/formatters/FormatDates";
import JobStatus from "@/app/enums/JobStatus.enum";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import toast from "react-hot-toast";
import { sanitizeJobData } from "@/app/server/formatters/JobDataSanitization";
import { createJob } from "@/app/server/services/JobDatabaseService";
import { setClientHasRated } from "@/app/server/services/RatingServices";

interface Props {
  refetch: () => void
}

const CreateJobModal = ({refetch}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState<Date>(new Date());
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);

  const [modalIsOpen, setIsOpen] = useState(false);

  const { user } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    Modal.setAppElement("#root");

    // get skills to populate the skill select bar
    const fetchSkills = async () => {
      try {
        const skills = await getAllSkills();
        //console.log(skills);
        setAllSkills(skills);
        setFilteredSkills(skills);
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    };

    fetchSkills();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const currentDate = formatDateAsNumber(new Date());
    const status = JobStatus.Posted;
    const clientUid = user?.authUser.uid;
    const hiredUid = "";

    // Validate title
    if (title === "") {
      toast("Please enter a title for the job");
      return;
    }

    // Validate description
    if (description === "") {
      toast("Please enter a description for the job");
      return;
    }

    //Validate budgets
    let minBud = 0,
      maxBud = 0;

    try {
      minBud = parseInt(minBudget);
      maxBud = parseInt(maxBudget);

      if (isNaN(minBud)) {
        toast.error("Please enter a minimum value for budget");
        return;
      }

      if (minBud === 0) {
        toast.error("Please enter a non zero number for the minimum budget");
        return;
      }

      if (isNaN(maxBud)) {
        toast.error("Please enter a maximum value for budget");
        return;
      }

      if (maxBud === 0) {
        toast.error("Please enter a non zero number for the maximum budget");
        return;
      }

      if (minBud > maxBud) {
        toast.error(
          "Please ensure that the minimum budget is less than the maximum budget"
        );
        return;
      }

      if (maxBud === minBud) {
        toast.error(
          "Please ensure that the minimum and maximum budgets are different numbers"
        );
        return;
      }
    } catch (error) {
      console.error("Error parsing budgets:", error);
    }

    // Validate Deadline
    const formattedDeadline = formatDateAsNumber(deadline);
    if (formattedDeadline <= formatDateAsNumber(new Date())) {
      toast.error("Please ensure that the deadline is in the future");
      return;
    }

    // Validate skills
    if (selectedSkills.length === 0) {
      toast.error("Please ensure that you have selected skills");
      return;
    }

    // create  {[skillArea: string]: string[]}
    const skillAreaSkillMap = await mapSkillsToAreas(selectedSkills);

    // validate the map
    if (Object.keys(skillAreaSkillMap).length === 0) {
      toast.error("Please select at least one skill");
      return;
    }
    //console.log(skillAreaSkillMap);

    const job = {
      title,
      description,
      budgetMin: minBud,
      budgetMax: maxBud,
      deadline: formattedDeadline,
      skills: skillAreaSkillMap,
      status,
      hiredUId: hiredUid,
      clientUId: clientUid,
      createdAt: currentDate,
      hasClientRated: false,
      hasFreelancerRated: false
    };
    //console.log(job);

    // sanitize data
    let sanitizedJobData;
    try {
      sanitizedJobData = sanitizeJobData(job);
    } catch (err) {
      console.error("Job data validation failed: ", err);
      return; // Don't continue if sanitization fails
    }

    // prompt: ensure user is sure they want to create this job
    const confirmed = window.confirm(
      "Are you sure you want to create this job with the details provided?"
    );
    if (!confirmed) {
      return; // Do nothing, let the user edit the info
    }

    try {
      await createJob(sanitizedJobData);
      toast.success("Job created successfully!");
      refetch();
      closeModal(); // Close the modal after successful creation
    } catch (err) {
      toast.error("Something went wrong when trying to create the job");
      console.error(err);
    }

    // Reset fields
    setTitle("");
    setDescription("");
    setDeadline(new Date());
    setMinBudget("");
    setMaxBudget("");
    setSelectedSkills([]);
    setSkillInput("");
    
  };

  const handleSkillSelect = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSelected = [...selectedSkills, skill];
      const newAvailable = allSkills.filter(
        (item) => !newSelected.includes(item)
      );

      setSelectedSkills(newSelected);
      setFilteredSkills(newAvailable);
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skill: string) => {
    const updatedSelected = selectedSkills.filter((s) => s !== skill);
    const updatedAvailable = [
      ...allSkills.filter((s) => !updatedSelected.includes(s)),
    ];

    setSelectedSkills(updatedSelected);
    setFilteredSkills(updatedAvailable);
  };

  //This function will prevent crashing on invalid dates and instead warn the user
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Basic check if input is empty
    if (!inputValue) {
      toast.error("Please select a date");
      return;
    }
    
    // Parse the date
    const newDate = new Date(inputValue);
    
    // Check if date is valid
    if (isNaN(newDate.getTime())) {
      toast.error("Invalid date format");
      return;
    }
    
    // If all checks pass
    setDeadline(newDate);
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleSkillInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);

    const filtered = allSkills
      .filter((skill) => !selectedSkills.includes(skill))
      .filter((skill) => skill.toLowerCase().includes(value.toLowerCase()));

    setFilteredSkills(filtered);
  };

  return (
    <section id="root">
      <button onClick={openModal}> Create Job </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className=" rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
        overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-40 flex items-center justify-center"
      >
        <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 ">
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
              <InputBar
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Job Title"
                type="text"
              />
              <textarea
                placeholder="Job Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="job-description"
                rows={4}
                style={{
                  width: "100%",
                  minHeight: "150px",
                  boxShadow: "0 0 0 1.5px #2b2c37, 0 0 25px -17px #000",
                  border: "0",
                  borderRadius: "12px",
                  backgroundColor: "#26272c",
                  outline: "none",
                  color: "white",
                  padding: "12px",
                  transition: "all 0.25s cubic-bezier(0.19, 1, 0.22, 1)",
                  cursor: "text",
                }}
              />
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
              <InputBar
                value={deadline.toISOString().split("T")[0]} // Only pass yyyy-mm-dd to the input field
                onChange={(e) => handleDateChange(e)} // Handle input as full Date
                placeholder="Deadline"
                type="date"
              />

              <section>
                <section className="flex flex-wrap gap-2 mb-2">
                  <InputBar
                    value={skillInput}
                    onChange={handleSkillInputChange}
                    placeholder="Skills"
                    type="text"
                  />
                </section>
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
                <Button caption={"Submit"} type="submit" />
              </section>
            </form>
          </article>
        </section>
      </Modal>
    </section>
  );
};

export default CreateJobModal;
