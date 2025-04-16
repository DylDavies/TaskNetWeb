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
import { getJob } from "../server/services/JobDatabaseService";

//constant for links to other pages
const links = [{ name: "Home", href: "/" }];

//this is a comment
export default function Page() {
  const [jobData, setJobData] = useState<JobData | null>(null);

  const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  // fetch job data
  useEffect(() => {
    async function fetchJobWithUID() {
      try {
        const jobData = await getJob("Kb3PXEXuWGlSrWug6Dn2");
        setJobData(jobData);
        console.log("Fetched job data: ", jobData);

        // more tests:
        console.log("Title: ", jobData?.title);
        console.log("Budget: ", jobData?.budget);
        console.log("Deadline: ", jobData?.deadline);
        console.log("Posted date: ", jobData?.createdAt);
        console.log("Skills: ", jobData?.skills);
        console.log("Description: ", jobData?.description);
        console.log("Client ID: ", jobData?.clientUId);
        console.log("Hired ID: ", jobData?.hiredUId);
        console.log("Status: ", jobData?.status);
      } catch (error) {
        console.error("Error occured while fetching Job: ", error);
      }
    }
  });

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
