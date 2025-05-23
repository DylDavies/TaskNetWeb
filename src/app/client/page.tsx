"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "../components/button/Button.css";
import { useRouter } from "next/navigation";
import CreateJobModal from "../components/CreateJobModal/CreateJobModal";
import { AuthContextType, AuthContext } from "../AuthContext";
import { useState, useContext, useEffect } from "react";
import JobCard from "../components/JobOverview/JobOverview";
import { getJobsByClientID } from "../server/services/JobDatabaseService";
import { formatDateAsString } from "../server/formatters/FormatDates";
import { formatBudget } from "../server/formatters/Budget";
import ActiveJob from "../interfaces/ActiveJob.interface";
import { JobContext, JobContextType } from "../JobContext";
import JobStatus from "../enums/JobStatus.enum";
import { useChatStore } from "../stores/chatStore";
//import { sanitizeJobData } from "../server/formatters/JobDataSanitization";

//constant for links to other pages

const links = [
  { name: "Home", href: "/client", selected: true },
  { name: "Chat", href: "/chat", selected: false },
];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const { setJobID } = useContext(JobContext) as JobContextType;

  const [jobCards, setJobCards] = useState<ActiveJob[]>([]);
  const { fetchJobsWithUsers } = useChatStore();
  const router = useRouter();

  const clientUId = user?.authUser.uid;

  // Gets JobData data to populate cards, only will show cards created by the user (client)
  async function fetchUserJobs() {
    if (!clientUId) {
      console.warn("Client ID is undefined");
      return;
    }
    try {
      const jobs = await getJobsByClientID(clientUId);
      setJobCards(jobs);
    } catch (error) {
      console.error("Error occurred when trying to fetch Jobs: ", error);
    }
  }
  useEffect(() => {
    fetchUserJobs();
  }, [clientUId]);

  // Click handler for clicking on a job card
  function handleCardClick(job: ActiveJob): void {
    const currentJobStatus = job.jobData.status;
    if (currentJobStatus == JobStatus.Deleted) return;

    setJobID(job.jobId);
    if (currentJobStatus === JobStatus.Posted) {
      router.push("/FreelancerApplicationView");
    } else {
      router.push("/Milestones");
    }
  }

  function refetch() {
    fetchUserJobs();
  }

  // populate JobsWithUsers in ChatStore
  useEffect(() => {
    if (!user) return;

    const setup = async () => {
      await fetchJobsWithUsers(user.authUser.uid, user.userData.type);
    };

    setup();
  }, [user, fetchJobsWithUsers]);

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#cdd5f6] text-white font-sans bg-color">
        <header className="w-full bg-orange-500 ">
          <Header
            usertype={"Client"}
            name={user?.userData.username || "Username"}
          />
        </header>

        <main className="flex-1 flex bg-[#cdd5f6] bg-color">
          <section className="w-64">
            <SideBar items={links} buttons={[CreateJobModal({ refetch })]} />
          </section>

          <section className="flex-1 p-4 flex flex-col items-center gap-6 overflow-y-auto">
            <WelcomeCard
              username={user?.userData.username || "Username"}
              type="client"
              avatar={user?.userData.avatar}
            />
            <section className="w-full px-6">
              <h2 className="text-2xl font-bold text-gray-300 flex justify-center">
                My job postings:{" "}
              </h2>
              <h3 className="text-2xl italic text-gray-300 flex justify-center">
                Click to see applicants if open to applicants and to create milestones if  someone has been hired:{" "}
              </h3>
              
               {/* Generate Job cards dynamically  */}
              <section className="border-2 border-gray-600 rounded-lg p-4 flex flex-wrap justify-center gap-6">
                {jobCards.length > 0 ? (
                  jobCards.map((job, index) => (
                    <JobCard
                      key={index}
                      clientId={user!.authUser.uid}
                      jobTitle={job.jobData.title}
                      budget={formatBudget(
                        job.jobData.budgetMin,
                        job.jobData.budgetMax
                      )}
                      deadline={formatDateAsString(job.jobData.deadline)}
                      skills={Object.values(job.jobData.skills).flat()}
                      onClick={() => handleCardClick(job)}
                      hired={job.jobData.status}
                      redactRating={true}
                    />
                  ))
                ) : (
                  <p className="text-gray-300 text-lg">No job postings yet.</p>
                )}
              </section>
            </section>
          </section>
        </main>

        <footer className="bg-[#f75509] py-4 flex justify-center bg-gray-900 box-footer">
          <p>© {new Date().getFullYear()} tasknet.tech</p>
        </footer>
      </section>
    </>
  );
}
