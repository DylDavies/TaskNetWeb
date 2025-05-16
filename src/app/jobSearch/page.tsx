"use client";
import Header from "../components/Header/header";
import SideBar from "../components/sidebar/SideBar";
import { useState, useContext, useEffect } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";
import MultiSelect from "../components/MultiSelectBar/MultiSelectBar";
import { getAllSkills } from "../server/services/SkillsService";
import JobCard from "../components/JobOverview/JobOverview";
import { getAllJobs } from "../server/services/JobDatabaseService";
import { formatDateAsDate, formatDateAsString } from "../server/formatters/FormatDates";
import { formatBudget } from "../server/formatters/Budget";
import ActiveJob from "../interfaces/ActiveJob.interface";
import MultiViewModal from "../components/MultiViewModal/MultiViewModal";
import JobStatus from "../enums/JobStatus.enum";
import InputBar from "../components/inputbar/InputBar";

//constant for links to other pages
const links = [
  { name: "Home", href: "/freelancer", selected: false },
  { name: "Find Jobs", href: "/jobSearch", selected: true },
  { name: "Chat", href: "/chat", selected: false }
];


export default function Page() {
  const [jobCards, setJobCards] = useState<ActiveJob[]>([]);
  const [skills, setSkills] = useState<string[]>([]); // all skills from all skills areas
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // Selected skills from filter
  const [jobNameFilter, setJobNameFilter] = useState("");
  const { user } = useContext(AuthContext) as AuthContextType;
  const [openModal, setModalOpen] = useState(false);
  const [data, setData] = useState<ActiveJob>();
  

  const closeModal = () => {
    setModalOpen(false);        
  };

  // Get all skills to populate array for auto-fill
  useEffect(() => {
    async function fetchSkills() {
      try {
        const skillData = await getAllSkills(); // gets all skills as an array
        setSkills(skillData);
      } catch (err) {
        console.error("could not fetch skillData: ", err);
      }
    }

    fetchSkills();
  }, []);


  useEffect(() => {
    async function filterJobs() {
      try {
        const activeJobs = await getAllJobs();
  
        const filtered = activeJobs.filter((job) => {
          if (job.jobData.status !== JobStatus.Posted) return false;
          if (formatDateAsDate(job.jobData.deadline) < new Date()) return false;
          const flattenedSkills = Object.values(job.jobData.skills).flat(); // Get all skills from all skill areas
          
          const jobTitle = job.jobData.title.toLowerCase();
  
          const matchesSkills = selectedSkills.every((selected) =>
            flattenedSkills.some(
              (skill) => skill.toLowerCase() === selected.toLowerCase()
            )
          );
  
          const matchesTitle =
            jobNameFilter.trim() === "" ||
            jobTitle.includes(jobNameFilter.toLowerCase());
  
          return matchesSkills && matchesTitle;
        });
  
        setJobCards(filtered);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    }
  
    filterJobs();
  }, [selectedSkills, jobNameFilter]);
  

  // Click handler for clicking on a job card
  function handleCardClick(job: ActiveJob): void {
    if(job?.jobData && job.jobId){
      setData(job);
      setModalOpen(true);
    }
    else{
      alert("Error: Something has gone wrong");
    }
  }

  return (
    <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
      <header className="w-full bg-orange-500">
        <Header
          name={user?.userData.username || "Username"}
          usertype="Find a Job"
        />
      </header>
  
      <main className="flex flex-1 bg-color dark:bg-[#cdd5f6]">
        {/* Sidebar */}
        <section className="w-64">
          <SideBar items={links} />
        </section>
  
        <section className="flex-1 flex flex-col items-center mt-6">
          {/* Filter Bars */}
          <section className="w-full max-w-4xl flex flex-col items-center gap-4 mb-2">
            {/* Job Title Filter */}
            <InputBar
              placeholder="Filter by job title..."
              value={jobNameFilter}
              onChange={(e) => setJobNameFilter(e.target.value)}
              className="!w-full max-w-md"
            />
  
            {/* Skill Filter */}
            <MultiSelect skills={skills} onSelect={setSelectedSkills} />
          </section>
  
          {/* Job Cards */}
          <section className="w-full flex flex-wrap justify-center gap-6 max-h-[67dvh] overflow-y-scroll no-scrollbar pt-2">
            {jobCards.map((job, index) => (
              <JobCard
                key={index}
                clientId={job.jobData.clientUId}         
                jobTitle={job.jobData.title}
                budget={formatBudget(
                  job.jobData.budgetMin,
                  job.jobData.budgetMax
                )}
                deadline={formatDateAsString(job.jobData.deadline)}
                skills={Object.values(job.jobData.skills).flat()}
                onClick={() => handleCardClick(job)}
              />
            ))}
            {openModal && data && (
              <MultiViewModal
              job = {data}
              modalIsOpen = {openModal}
              onClose={closeModal}/>
            )}
          </section>
        </section>
      </main>
  
      {/* Footer */}
      <footer className="bg-[#f75509] py-4 flex justify-center bg-gray-900 box-footer">
        <p>© {new Date().getFullYear()} tasknet.tech</p>
      </footer>
    </section>
  );
  

}
