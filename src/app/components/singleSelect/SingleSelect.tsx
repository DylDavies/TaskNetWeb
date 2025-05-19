"use client";
import SkillData from "@/app/interfaces/SkillData.interface";
import React from "react";

interface MultiSelectProps {
  skills: SkillData[];
  onSelect: (selectedSkills: string) => void; // Add the onSelect prop
}

const SingleSelect: React.FC<MultiSelectProps> = ({ skills, onSelect }) => {
  const filtered = skills;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = e.target.value;
        onSelect(selected);
    }

  return (
    <section className="flex items-center rounded-lg bg-[#26272c] py-2 px-4">
    {/*<label className="whitespace-nowrap">Choose a Skills Area:</label>*/}
    <select className="rounded py-1 px-1 focus:outline-none" onChange={handleChange}>
        {filtered.length > 0? (filtered.map((skill) =>
        <option key = {skill.id} className="bg-[#26272c] focus:outline-none" value ={skill.id}>{skill.id}</option>)):null}
    </select>
    </section>
  )
};

export default SingleSelect;
