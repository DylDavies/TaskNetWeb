"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import { useState, useContext, useEffect } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import MultiSelect from "../components/MultiSelectBar/MultiSelectBar";
import { getAllSkills } from "../server/services/SkillsService";
import JobCard from "../components/JobOverview/JobOverview";
import { getAllJobs } from "../server/services/JobDatabaseService";
import { formatDateAsString } from "../server/formatters/FormatDates";
import { formatBudget } from "../server/formatters/Budget";
import ActiveJob from "../interfaces/ActiveJob.interface";
import MultiViewModal from "../components/MultiViewModal/MultiViewModal";
import { getUser } from "../server/services/DatabaseService";
//import { searchJobsBySkills } from "../server/services/JobDatabaseService";

//constant for links to other pages
const links = [
  { name: "Home", href: "/" },
  { name: "freelancer", href: "/freelancer" }
];

export default function Page() {
  const [jobCards, setJobCards] = useState<ActiveJob[]>([]);
  const [skills, setSkills] = useState<string[]>([]); // all skills from all skills areas
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // Selected skills from filter
  const { user } = useContext(AuthContext) as AuthContextType;
  const [openModal, setModalOpen] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<ActiveJob>();
  const [clientUsernames, setClientUsernames] = useState<
    Record<string, string>
  >({});

  type JobData = {
    company: string;
    jobTitle: string;
    jobId: string;
  };

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

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
      const uniqueClientUIds = Array.from(
        new Set(jobCards.map((job) => job.jobData.clientUId))
      );

      for (const uid of uniqueClientUIds) {
        if (!clientUsernames[uid]) {
          try {
            const userData = await getUser(uid);
            newUsernames[uid] = userData?.username || "Unknown";
          } catch (error) {
            console.error(`Failed to fetch username for UID ${uid}:`, error);
            newUsernames[uid] = "Unknown";
          }
        }
      }

      if (Object.keys(newUsernames).length > 0) {
        setClientUsernames((prev) => ({ ...prev, ...newUsernames }));
      }
    };

    if (jobCards.length > 0) fetchUsernames();
  }, [jobCards]);

  // Gets ActiveJob data to populate cards - can change to JobData if JobID isn't needed
  useEffect(() => {
    async function filterJobsBySkills() {
      try {
        const activeJobs = await getAllJobs();

        const filtered = activeJobs.filter((job) => {
          const flattenedSkills = Object.values(job.jobData.skills).flat(); // Get all skills from all skill areas
          return selectedSkills.every((selected) =>
            flattenedSkills.some(
              (skill) => skill.toLowerCase() === selected.toLowerCase()
            )
          );
        });

        setJobCards(filtered);
      } catch (error) {
        console.error("Error occurred when trying to fetch Jobs: ", error);
      }
    }

    filterJobsBySkills();
  }, [selectedSkills]);

  // Click handler for clicking on a job card
  function handleCardClick(job: ActiveJob): void {
    console.log(job); // need this for linter & testing
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
      <header className="w-full bg-orange-500 ">
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

        <section className="flex-1 flex flex-col items-center p-6 gap-6">
          <section className="w-full max-w-3xl flex justify-center mb-10">
            <MultiSelect skills={skills} onSelect={setSelectedSkills} />
          </section>

          {/* Generate Job cards dynamically  */}
          <section className="w-full flex flex-wrap justify-center gap-6">
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
        <Button caption={"Log out"} onClick={() => signoutClick()} />
      </footer>
    </section>
  );
}
