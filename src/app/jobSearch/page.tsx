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
import SearchBar from "../components/searchbar/SearchBar";
import MultiViewModal from "../components/MultiViewModal/MultiViewModal";
import { getUser } from "../server/services/DatabaseService";
import JobStatus from "../enums/JobStatus.enum";
//import { searchJobsBySkills } from "../server/services/JobDatabaseService";

//constant for links to other pages
const links = [
  { name: "Home", href: "/freelancer", selected: false },
  { name: "Find Jobs", href: "/jobSearch", selected: true },
];


export default function Page() {
  const [jobCards, setJobCards] = useState<ActiveJob[]>([]);
  const [skills, setSkills] = useState<string[]>([]); // all skills from all skills areas
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // Selected skills from filter
  const [jobNameFilter, setJobNameFilter] = useState("");
  const { user } = useContext(AuthContext) as AuthContextType;
  const [openModal, setModalOpen] = useState(false);
  const [data, setData] = useState<ActiveJob>();
  const [clientUsernames, setClientUsernames] = useState<
    Record<string, string>
  >({});
  const [clientAvatars, setClientAvatars] = useState<
  Record<string, string | undefined>
>({});

  const closeModal = () => {
    setModalOpen(false);        
  };

  // Get all skills to populate array for auto-fill
  useEffect(() => {
    async function fetchSkills() {
      try {
        const skillData = await getAllSkills(); // gets all skills as an array
        //console.log(skillData);
        setSkills(skillData);
      } catch (err) {
        console.error("could not fetch skillData: ", err);
      }
    }

    fetchSkills();
  }, []);

  // Fetch usernames when jobCards changes
  useEffect(() => {
    const fetchUsernames = async () => {
      const newUsernames: Record<string, string> = {};
      const newAvatars: Record<string, string | undefined> = {};
      const uniqueClientUIds = Array.from(
        new Set(jobCards.map((job) => job.jobData.clientUId))
      );

      for (const uid of uniqueClientUIds) {
        if (!clientUsernames[uid]) {
          try {
            const userData = await getUser(uid);
            newUsernames[uid] = userData?.username || "Unknown";
            newAvatars[uid] = userData?.avatar || undefined;
          } catch (error) {
            console.error(`Failed to fetch user data for UID ${uid}:`, error);
            newUsernames[uid] = "Unknown";
            newAvatars[uid] = undefined;
          }
        }
      }

      if (Object.keys(newUsernames).length > 0) {
        setClientUsernames((prev) => ({ ...prev, ...newUsernames }));
      }

      if (Object.keys(newAvatars).length > 0) {
        setClientAvatars((prev) => ({ ...prev, ...newAvatars }));
      }
    };

    if (jobCards.length > 0) fetchUsernames();
  }, [jobCards, clientUsernames]);

  // Gets ActiveJob data to populate cards - can change to JobData if JobID isn't needed
  // useEffect(() => {
  //   async function filterJobsBySkills() {
  //     try {
  //       const activeJobs = await getAllJobs();

  //       const filtered = activeJobs.filter((job) => {
  //         const flattenedSkills = Object.values(job.jobData.skills).flat(); // Get all skills from all skill areas
  //         return selectedSkills.every((selected) =>
  //           flattenedSkills.some(
  //             (skill) => skill.toLowerCase() === selected.toLowerCase()
  //           )
  //         );
  //       });

  //       setJobCards(filtered);
  //     } catch (error) {
  //       console.error("Error occurred when trying to fetch Jobs: ", error);
  //     }
  //   }

  //   filterJobsBySkills();
  // }, [selectedSkills]);

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
  
        <section className="flex-1 flex flex-col items-center pt-6 gap-2 h-90">
          {/* Filter Bars */}
          <section className="w-full max-w-4xl flex flex-col items-center gap-4 mb-5">
            {/* Job Title Filter */}
            <SearchBar
              placeholder="Filter by job title..."
              value={jobNameFilter}
              onChange={(e) => setJobNameFilter(e.target.value)}
              className="w-full max-w-md"
            />
  
            {/* Skill Filter */}
            <MultiSelect skills={skills} onSelect={setSelectedSkills} />
          </section>
  
          {/* Job Cards */}
          <section className="w-full flex flex-wrap justify-center overflow-y-scroll h-1/2">
            {jobCards.map((job, index) => (
              <JobCard
                key={index}
                company= {clientUsernames[job.jobData.clientUId] || "Loading..."}         
                jobTitle={job.jobData.title}
                budget={formatBudget(
                  job.jobData.budgetMin,
                  job.jobData.budgetMax
                )}
                deadline={formatDateAsString(job.jobData.deadline)}
                skills={Object.values(job.jobData.skills).flat()}
                onClick={() => handleCardClick(job)}
                avatar={clientAvatars[job.jobData.clientUId] || undefined}
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
      <footer className="py-4 flex justify-end bg-gray-900 box-footer">
        <p>© {new Date().getFullYear()} tasknet.tech</p>
      </footer>
    </section>
  );
  

}
