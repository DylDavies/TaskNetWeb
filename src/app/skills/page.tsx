"use client";

import "../components/AdminTable/AdminTable.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";
import { AddSkill, getSkillArray } from "../server/services/SkillsService";
import SkillData from "../interfaces/SkillData.interface";
import SkillsTable from "../components/SkillsTable/SkillsTable";
import InputBar from "../components/inputbar/InputBar";
import SingleSelect from "../components/singleSelect/SingleSelect";
import toast from "react-hot-toast";


const links = [
  { name: "Admin", href: "/admin" , selected: false},
  { name: "Skills Management", href: "/skills", selected: true }
  ];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [skills, setSkills] = useState<SkillData[]>([]);
  const[inputValue, setInputValue] = useState("");
  const [selectedSkillArea, setSelectedSkillArea] = useState<string>();

  //Takes in a skills as an input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const fetchSkills = async () => {
    try{
        const fetchSkills = await getSkillArray();
        setSkills(fetchSkills)
        setSelectedSkillArea(fetchSkills[0].id)
    } catch (error){
        console.error("Error fetching skills:", error);
    }
};

  //Fetched all the skills 
  useEffect(() => {
    if (skills.length == 0) fetchSkills();
  },[skills, selectedSkillArea]);

  //Adds a new skill to the database
  const addSkills = async () => {
    if(selectedSkillArea == undefined){
        toast.error("No Skills Area Selected");
    }
    else if(inputValue == ""){
        toast.error("No Skill Entered");
    }
    else{
      let found = false;

      for (const sa of skills) {
        if (sa.skills.map(v => v.toLowerCase()).includes(inputValue.toLowerCase())) found = true;
      }

      if (found) {
        return toast.error("This skill already exists!")
      }

      await AddSkill(selectedSkillArea, inputValue);
      setInputValue("");

      await fetchSkills();

      toast.success("Skill Successfully added")
    }
  }

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full bg-orange-500">
          <Header name={user?.userData.username || "Admin"} usertype="Admin" />
        </header>

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">
                <section className="flex items-center space-x-8">
                    {skills && (<SingleSelect skills={skills} onSelect={setSelectedSkillArea}/>)}

                    <InputBar placeholder={"Enter Skills"}
                    value={inputValue}
                    onChange={handleInput}/>

                    <Button caption="Add skill" onClick={addSkills}/>

                </section>

                

                {skills && (<SkillsTable data={skills}/>)}
              
            </section>
          </section>
        </main>

      {/* Footer */}
      <footer className="bg-[#f75509] py-4 flex justify-center bg-gray-900 box-footer">
        <p>© {new Date().getFullYear()} tasknet.tech</p>
      </footer>
      </section>
    </>
  );
}
