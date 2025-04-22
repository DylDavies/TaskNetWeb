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
import JobForm from "../components/JobFormModal/JobFormModal";
import ViewJobModal from "../components/ViewJobModal/ViewJobModal";
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
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState<JobFormData>();
  const [viewData, setViewData] = useState<JobViewData>();

  type JobFormData = {
    company: string;
    jobTitle: string;
    jobId: string;
  };

  interface JobViewData {
    title: string;
    company: string;
    companyImage: string;
    description: string;
    minBudget: string;
    maxBudget: string;
    deadline: string;
    status: string;
    skills: string[]; // Added skills array
  }

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  const closeApplyModal = () => {
    setApplyModalOpen(false);        
  };

  const closeViewModal = () =>{
    setViewModalOpen(false);
  };

  const openApplyModal = () =>{
    setApplyModalOpen(true);
    setViewModalOpen(false);
  }

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
      setViewData({title: job.jobData.title, company: job.jobData.title, companyImage: "", description: job.jobData.description, minBudget: String(job.jobData.budgetMin), maxBudget: String(job.jobData.budgetMax), deadline: String(job.jobData.deadline), status: String(job.jobData.status), skills: Object.values(job.jobData.skills).flat()});
      setFormData({company: job.jobData.clientUId, jobTitle: job.jobData.title, jobId: job.jobId});
      setViewModalOpen(true);
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
                company={job.jobData.clientUId}
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
            {viewModalOpen && viewData && (
              <ViewJobModal
              job = {viewData}
              isOpen={viewModalOpen}
              onApply={openApplyModal}
              onClose={closeViewModal}/>
            )}
            {applyModalOpen && formData && (
          <JobForm
            data={formData}
            isOpen={applyModalOpen}
            onClose={closeApplyModal} 
          /> 
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
