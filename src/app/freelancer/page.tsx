"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";
import { useState, useContext, useEffect } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import JobData from "../interfaces/JobData.interface";
import MultiSelect from "../components/MultiSelectBar/MultiSelectBar";
import { getAllSkills } from "../server/services/SkillsService";

//constant for links to other pages
const links = [{ name: "Home", href: "/" }];

export default function Page() {
  const [jobData] = useState<JobData | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // Track selected skills
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  useEffect(() => {
    async function fetchSkills() {
      try {
        const skillData = await getAllSkills(); // this returns all skills as one flat array
        setSkills(skillData);
      } catch (err) {
        console.error("could not fetch skillData: ", err);
      }
    }

    fetchSkills();
  }, []);

  useEffect(() => {
    // Sanity check
    //console.log("Selected Skills:", selectedSkills);
  }, [selectedSkills]);

  return (
    <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
      <header className="w-full bg-orange-500 ">
        <Header
          name={user?.userData.username || "Username"}
          usertype="Freelancer"
        />
      </header>

      <main className="flex flex-1 dark:bg-[#cdd5f6] bg-color">
        {/* Sidebar */}
        <section className="w-64">
          <SideBar items={links} />
        </section>

        {/* Job data section (for testing purposes) */}
        <section>
          <p>{jobData?.title}</p>
        </section>

        {/* MultiSelect for selecting skills */}
        <MultiSelect
          skills={skills}
          onSelect={setSelectedSkills} // Pass the function to update selected skills
        />

        {/* Welcome card section */}
        <section className="flex-1 p-4 flex items-start justify-center">
          <WelcomeCard
            username={user?.userData.username || "Username"}
            type="freelancer"
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 flex justify-end bg-gray-900 box-footer">
        <Button caption={"Log out"} onClick={() => signoutClick()} />
      </footer>
    </section>
  );
}
