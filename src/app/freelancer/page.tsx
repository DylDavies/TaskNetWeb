"use client";

import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";
import { useContext } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import JobForm from "../components/JobApplicationModal/JobApplication"

//constant for links to other pages
const links = [
  { name: "Home", href: "/" },
  { name: "Find Jobs", href: "/jobSearch" },
];


const jobData = {
    company: "Company name",
    jobTitle: "Title of job",
    budget: "180k - 250k",
    deadline: "30 April 2025",
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Git"],
  };


//this is a comment
export default function Page() {
  //const [jobData] = useState<JobData | null>(null);
  /*const [cardData, setCardData] = useState<cardProps | null>(null);*/
export default function Page() {
  const [jobData] = useState<JobData | null>(null);
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

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

        {/* Job data section (linter tunes without) */}
        <section>
          <p>{jobData?.title}</p>
        </section>

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
