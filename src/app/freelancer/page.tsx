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
import JobCard from "../components/JobOverview/JobOverview";
import ActiveJob from "../interfaces/ActiveJob.interface";
import { getUsername } from "../server/services/DatabaseService";
import { getJobsByFreelancerID } from "../server/services/JobDatabaseService";
import { formatDateAsString } from "../server/formatters/FormatDates";
import { formatBudget } from "../server/formatters/Budget";
import JobStatus from "../enums/JobStatus.enum";
import { JobContext, JobContextType } from "../JobContext";

//constant for links to other pages
const links = [
  { name: "Home", href: "/" },
  { name: "Find Jobs", href: "/jobSearch" },
  { name: "Chat", href: "/chat" },
];

export default function Page() {
  const [jobData] = useState<JobData | null>(null);
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const [jobCards, setJobCards] = useState<ActiveJob[]>([]);
  const [username, setUsername] = useState<string>("");
  const FreelancerUId = user?.authUser.uid ;
  const { setJobID } = useContext(JobContext) as JobContextType; 

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  async function fetchUserJobs() {
    if (!FreelancerUId) {
      console.warn("Client ID is undefined");
      return;
    }
      try {
        const jobs = await getJobsByFreelancerID(FreelancerUId); 
        setJobCards(jobs);
      } catch (error) {
        console.error("Error occurred when trying to fetch Jobs: ", error);
      } 
  }
  useEffect(() => {
    fetchUserJobs();
  }, [FreelancerUId]);
  
  useEffect(() => {
    async function fetchUsername() {
      if (FreelancerUId) {
        const name = await getUsername(FreelancerUId);
        setUsername(name);
      }
    }
    fetchUsername();
  }, [FreelancerUId]);

  function handleCardClick(job: ActiveJob): void {

    const currentJobStatus = job.jobData.status
    if (currentJobStatus == JobStatus.Deleted) return;

    setJobID(job.jobId);
    router.push("/Milestones");
    
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
        <section className="flex-1 p-4 flex flex-col items-center gap-6 overflow-y-auto">
          <WelcomeCard
            username={user?.userData.username || "Username"}
            type="freelancer"
          />
          <section className="w-full px-6">
              <h2 className="text-2xl font-bold text-gray-300 flex justify-center">My jobs: </h2>
              <h3 className="text-2xl italic text-gray-300 flex justify-center">Click to see more information: </h3>
              <section className ="border-2 border-gray-600 rounded-lg p-4 flex flex-wrap justify-center gap-6">
              {jobCards.length > 0 ? (
                jobCards.map((job, index) => (
                  <JobCard
                    key={index}
                    company={username}
                    jobTitle={job.jobData.title}
                    budget={formatBudget(job.jobData.budgetMin, job.jobData.budgetMax)}
                    deadline={formatDateAsString(job.jobData.deadline)}
                    skills={Object.values(job.jobData.skills).flat()}
                    onClick={() => handleCardClick(job)}
                    hired={job.jobData.status}
                  />
                ))
              ) : (
                <p className="text-gray-300 text-lg">No job postings yet.</p>
              )}
              </section>
        </section>

        </section>
      </main>

      
      {/* Footer */}
      <footer className="py-4 flex justify-end bg-gray-900 box-footer">
        <Button caption={"Log out"} onClick={() => signoutClick()} />
      </footer>
    </section>
  );
}
