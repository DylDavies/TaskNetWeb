"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";
import { useEffect, useState, useContext } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import JobData from "../interfaces/JobData.interface";
import { getAllJobs, getJob } from "../server/services/JobDatabaseService";
import { getSkillByID } from "../server/services/adminService";
import { formatDateAsString } from "../server/formatters/FormatDates";
import JobCard from "../components/JobOverview/JobOverview";
import { formatBudget } from "../server/formatters/Budget";

//constant for links to other pages
const links = [{ name: "Home", href: "/" }];

//this is a comment
export default function Page() {
  const [jobData, setJobData] = useState<JobData | null>(null);
  /*const [cardData, setCardData] = useState<cardProps | null>(null);*/
  const { user } = useContext(AuthContext) as AuthContextType;
  const router = useRouter();

  /*
  type cardProps = {
    company: string;
    jobTitle: string;
    budget: string;
    deadline: string;
    skills: string[];
  };*/

  const handleLoggingJobs = async () => {
    try {
      const { jobs, jobIDs } = await getAllJobs();
      console.log("=== LIST OF JOBS ===");
      console.table(jobs); // Displays jobs in a nice table format
      console.log("Job IDs:", jobIDs);
      console.log("=== LIST OF JOBS ===");
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // fetch job data
  useEffect(() => {
    async function fetchJobWithUID() {
      try {
        const jobData = await getJob("Kb3PXEXuWGlSrWug6Dn2");
        setJobData(jobData);
        console.log("Fetched job data: ", jobData);

        let firstSkill = "";
        if (jobData) {
          firstSkill = Object.keys(jobData.skills)[0];
        }
        const skillsArray = await getSkillByID(firstSkill);

        // more tests:
        console.log("Title: ", jobData?.title);
        console.log("Budget min: ", jobData?.budgetMin);
        console.log("Budget max: ", jobData?.budgetMax);
        console.log("Deadline: ", formatDateAsString(jobData?.deadline));
        console.log("Posted date: ", formatDateAsString(jobData?.createdAt));
        console.log("Skills map: ", jobData?.skills);
        console.log("Skills: ", skillsArray);
        console.log("Description: ", jobData?.description);
        console.log("Client ID: ", jobData?.clientUId);
        console.log("Hired ID: ", jobData?.hiredUId);
        console.log("Status: ", jobData?.status);

        // propsCard: (don't want to use it just yet)
        /*
        setCardData({
          company: jobData?.clientUId || "Unknown Company",
          jobTitle: jobData?.title || "Untitled Position",
          budget: formatBudget(jobData?.budgetMin, jobData?.budgetMax),
          deadline: formatDateAsString(jobData?.deadline),
          skills: skillsArray || [],
        });*/
      } catch (error) {
        console.error("Error occurred while fetching Job: ", error);
      }
    }
    fetchJobWithUID();
  }, []);

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  return (
    <>
      <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
        <header className="w-full bg-orange-500 ">
          <Header
            name={user?.userData.username || "Username"}
            usertype="Freelancer"
          />
        </header>

        <main className="flex flex-1 dark:bg-[#cdd5f6] bg-color">
          {/*side bar to the left of the page*/}
          <section className="w-64">
            <SideBar items={links} />
          </section>

          {/* Testing job data - need this to pass the lint */}
          <section>
            <p>{jobData?.title}</p>
          </section>

          {/*Testing Job card with data*/}
          <section className="max-w-2xl mx-auto">
            {/* Change skills = once endpoint has been written to get skills for that job */}
            {jobData ? (
              <JobCard
                company={jobData.clientUId || "Unknown Company"}
                jobTitle={jobData.title || "Untitled Position"}
                budget={formatBudget(jobData.budgetMin, jobData.budgetMax)}
                deadline={formatDateAsString(jobData.deadline)}
                skills={Object.keys(jobData.skills)} // Or transform as needed
              />
            ) : (
              <p>Loading job data...</p>
            )}
          </section>

          <section>
            <Button caption={"Log Jobs"} onClick={handleLoggingJobs} />
          </section>

          {/*welcome card centred right underneath the header*/}
          <section className="flex-1 p-4 flex items-start justify-center">
            <WelcomeCard
              username={user?.userData.username || "Username"}
              type="freelancer"
            />
          </section>
        </main>

        <footer className=" py-4 flex justify-end bg-gray-900 box-footer">
          <Button caption={"Log out"} onClick={() => signoutClick()} />
        </footer>
      </section>
    </>
  );
}
