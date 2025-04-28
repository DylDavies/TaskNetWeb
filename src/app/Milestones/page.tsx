"use client";

import "../components/searchbar/SearchBar.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import React, { useContext, useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import { getJob } from "../server/services/JobDatabaseService";
import { JobContext, JobContextType } from "../JobContext";
import UserType from "../enums/UserType.enum";
import MilestonesTable from "../components/MilestonesTable.tsx/MilestonesTable";
import CreateMilestone from "../components/CreateMilestone/CreateMilestone";


const linksClient = [
  { name: "back", href: "/client" }];

const linksFreelancer = [
    { name: "back", href: "/freelancer" }
]


export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const { jobID } = useContext(JobContext) as JobContextType;

  const fakeRefetch = () => {
    console.log("Refetch called (fake)");
  };
  
  //This function converts the usetype to a string to be displayed in the header
  function userTypeToString(value: UserType| undefined): string {
    if (value === undefined) return 'Unknown';
    return UserType[value] || '...';
    }
    const userTypeNum = user?.userData.type
    const userTypeString = userTypeToString(userTypeNum)

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
      AuthService.googleSignout();
     router.push("/");
  }

  const [jobTitle, setJobTitle] = useState<string>("");

  //To set the job title of the page
  useEffect(() => {
    async function fetchJobTitle() {
      try {
        const job = await getJob(jobID as string);
        if (job) {
          setJobTitle(job.title); // assumes title exists
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    }
  
    fetchJobTitle();
  }, []);

  function handleMilestoneClick() {
    alert("This hasn't been implemented yet.");
  }

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full">
          <Header name={user?.userData.username || "..."} usertype= {userTypeString } />
        </header>

        

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={userTypeString === 'Client' ? linksClient: linksFreelancer} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">

              <section className="px-6 py-4 bg-gray-800 text-black shadow rounded-xl m-4">
                <h1 className="text-2xl font-semibold text-gray-300">
                    Milestones for <strong className="">{jobTitle || "..."}</strong>
                </h1>
            </section>
            <section className="w-full max-w-8xl flex justify-start mb-4 ">
                <CreateMilestone refetch={fakeRefetch}/>
            </section>
               

              {/* FATable moved down */}
              <section className="w-full max-w-8xl mt-36">
                <MilestonesTable onMilestoneClick={handleMilestoneClick} />
              </section>
            </section>
          </section>
        </main>

        <footer className="bg-gray-900 box-footer px-6 py-4">

            <section className="flex justify-end">
              <Button caption={"Log out"} 
              onClick={() => signoutClick() } />
            </section>
          
        </footer>
      </section>
    </>
  );

}