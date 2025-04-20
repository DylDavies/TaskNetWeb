"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import CreateJobModal from "../components/CreateJobModal/CreateJobModal";
import { AuthContextType, AuthContext } from "../AuthContext";
import { useState, useContext, useEffect } from "react";
import JobCard from "../components/JobOverview/JobOverview";
import { getJobsByClientID } from "../server/services/JobDatabaseService";
import { formatDateAsString } from "../server/formatters/FormatDates";
import { formatBudget } from "../server/formatters/Budget";
import JobData from "../interfaces/JobData.interface";
import { getUsername } from "../server/services/DatabaseService";
//import { sanitizeJobData } from "../server/formatters/JobDataSanitization";



//constant for links to other pages

const links = [{ name: "Home", href: "/" }];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [jobCards, setJobCards] = useState<JobData[]>([]);

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }
  const clientUId = user?.authUser.uid ;
  const [username, setUsername] = useState<string>("");
  
  

  // Gets JobData data to populate cards, only will show cards created by the user (client)
  useEffect(() => {
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
    fetchUserJobs();
  }, [clientUId]);
  
  useEffect(() => {
    async function fetchUsername() {
      if (clientUId) {
        const name = await getUsername(clientUId);
        setUsername(name);
      }
    }
    fetchUsername();
  }, [clientUId]);
 

  // Click handler for clicking on a job card
  function handleCardClick(job: JobData): void {
    console.log(job); // need this for linter & testing
    alert("Not implemented yet :(");
  }

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#cdd5f6] text-white font-sans bg-color">
        <header className="w-full bg-orange-500 ">
          <Header
            usertype={"Client"}
            name={user?.userData.username || "Username"}
          />
        </header>

         {/* Generate Job cards dynamically  */}
        

        <main className="flex-1 flex bg-[#cdd5f6] bg-color">
         

          <section className="w-64">
            <SideBar items={links} myfunction={CreateJobModal}/>
          </section>

          <section className="flex-1 p-4 flex flex-col items-center gap-6 overflow-y-auto">
            <WelcomeCard
              username={user?.userData.username || "Username"}
              type="client"
            />
            <section className="w-full px-6">
              <h2 className="text-2xl font-bold text-gray-300 flex justify-center">My job postings: </h2>
              <h3 className="text-2xl italic text-gray-300 flex justify-center">Click to see applicants: </h3>
              <section className ="border-2 border-gray-600 rounded-lg p-4 flex flex-wrap justify-center gap-6">
              {jobCards.length > 0 ? (
                jobCards.map((job, index) => (
                  <JobCard
                    key={index}
                    company={username}
                    jobTitle={job.title}
                    budget={formatBudget(job.budgetMin, job.budgetMax)}
                    deadline={formatDateAsString(job.deadline)}
                    skills={Object.values(job.skills).flat()}
                    onClick={() => handleCardClick(job)}
                    hired={job.status}
                  />
                ))
              ) : (
                <p className="text-gray-300 text-lg">No job postings yet.</p>
              )}
              </section>
              
            </section>
          </section>

          
        </main>

        <footer className="bg-[#f75509] py-4 flex justify-end bg-gray-900 box-footer">
          <Button caption={"Log out"} onClick={() => signoutClick()} />
        </footer>
      </section>
    </>
  );
}
