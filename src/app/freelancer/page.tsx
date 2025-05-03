"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "../components/button/Button.css";
import "./global.css";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import JobData from "../interfaces/JobData.interface";
import JobCard from "../components/JobOverview/JobOverview";
import ActiveJob from "../interfaces/ActiveJob.interface";
import { getUser } from "../server/services/DatabaseService";
import { getJobsByFreelancerID } from "../server/services/JobDatabaseService";
import { formatDateAsString } from "../server/formatters/FormatDates";
import { formatBudget } from "../server/formatters/Budget";
import JobStatus from "../enums/JobStatus.enum";
import { JobContext, JobContextType } from "../JobContext";
import UserData from "../interfaces/UserData.interface";

//constant for links to other pages
const links = [
  { name: "Home", href: "/", selected: true },
  { name: "Find Jobs", href: "/jobSearch", selected: false },
  { name: "Chat", href: "/chat", selected: false },
];

export default function Page() {
  const [jobData] = useState<JobData | null>(null);
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();
  const [jobCards, setJobCards] = useState<
    { job: ActiveJob; client: UserData | null }[]
  >([]);
  const FreelancerUId = user?.authUser.uid;
  const { setJobID } = useContext(JobContext) as JobContextType;

  async function fetchUserJobs() {
    if (!FreelancerUId) {
      console.warn("Client ID is undefined");
      return;
    }
    try {
      const jobs = await getJobsByFreelancerID(FreelancerUId);

      const arr: { job: ActiveJob; client: UserData | null }[] = [];

      for await (const j of jobs) {
        arr.push({ job: j, client: await getUser(j.jobData.clientUId) });
      }

      setJobCards(arr);
    } catch (error) {
      console.error("Error occurred when trying to fetch Jobs: ", error);
    }
  }
  useEffect(() => {
    fetchUserJobs();
  }, [FreelancerUId]);

  function handleCardClick(job: ActiveJob): void {
    const currentJobStatus = job.jobData.status;
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
            <h2 className="text-2xl font-bold text-gray-300 flex justify-center">
              My jobs:{" "}
            </h2>
            <h3 className="text-2xl italic text-gray-300 flex justify-center">
              Click to see more information:{" "}
            </h3>
            <section className="border-2 border-gray-600 rounded-lg p-4 flex flex-wrap justify-center gap-6">
              {jobCards.length > 0 ? (
                jobCards.map((job, index) => {
                  return (
                    <JobCard
                      key={index}
                      company={job.client?.username || "..."}
                      jobTitle={job.job.jobData.title}
                      budget={formatBudget(
                        job.job.jobData.budgetMin,
                        job.job.jobData.budgetMax
                      )}
                      deadline={formatDateAsString(job.job.jobData.deadline)}
                      skills={Object.values(job.job.jobData.skills).flat()}
                      onClick={() => handleCardClick(job.job)}
                      hired={job.job.jobData.status}
                      avatar={job.client?.avatar}
                    />
                  );
                })
              ) : (
                <p className="text-gray-300 text-lg">No job postings yet.</p>
              )}
            </section>
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
