"use client";

import FATable from "../components/FATable/FATable";
import "../components/FATable/FATable.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import "../components/button/Button.css";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";
import { getJob } from "../server/services/JobDatabaseService";
import { JobContext, JobContextType } from "../JobContext";

//On this page, clients can view freelancers applications to their jobs

const links = [
  { name: "Home", href: "/client", selected: false }];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const { jobID } = useContext(JobContext) as JobContextType;
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

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full">
          <Header name={user?.userData.username || "Client"} usertype="Client" />
        </header>

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">

              <section className="px-6 py-4 bg-gray-800 text-black shadow rounded-xl m-4">
                <h1 className="text-2xl font-semibold text-gray-300">
                    Job Applicants for <strong className="">{jobTitle || "..."}</strong>
                </h1>
                </section>

              <section className="w-full max-w-8xl mt-36">
                <FATable jobName={jobTitle} />
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