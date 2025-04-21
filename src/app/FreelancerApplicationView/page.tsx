"use client";

import FATable from "../components/FATable/FATable";
import "../components/FATable/FATable.css";
//import SearchBar from "../components/searchbar/SearchBar";
import "../components/searchbar/SearchBar.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import { getPendingApplicants } from "../server/services/ApplicationDatabaseServices";
import React, { useContext, useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import JobStore from "../JobStore";
import { getJob } from "../server/services/JobDatabaseService";
import ClientModal from "../components/ClientModal/clientModal";
import ApplicantionStatus from "@/app/enums/ApplicantionStatus.enum";


const links = [
  { name: "back", href: "/client" },
  
];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
      AuthService.googleSignout();
     router.push("/");
  }

  //const [searchQuery, setSearchQuery] = useState("");

  /* Testing fetching pending users (START)*/
  interface ApplicantData {
    ApplicantID: string;
    ApplicationDate: number;
    BidAmount: number;
    CVURL: string;
    EstimatedTimeline: number;
    JobID: string;
    Status: ApplicantionStatus;
    username: Promise<string>;

}
  const [jobTitle, setJobTitle] = useState<string>("");

  //To set the job title of the page
  useEffect(() => {
    async function fetchJobTitle() {
      try {
        const job = await getJob(JobStore.getJobId());
        if (job) {
          setJobTitle(job.title); // assumes title exists
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    }
  
    fetchJobTitle();
  }, []);

  const [pendingApplicants, setPendingApplicants] = useState<ApplicantData[]>([]);

  // To update the table after the client accepts or rejects applicants
  useEffect(() => {
    async function fetchPendingApplicants() {
      const pendingApplicants = await getPendingApplicants(JobStore.getJobId());
      //console.log("Pending users: ", pendingUsers);
      setPendingApplicants(pendingApplicants);
    }

    fetchPendingApplicants();
  }, []);

  /* Testing fetching pending users (END) */
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleRowClick = (ApplicantID: ApplicantData) => {
    
    console.log("selected applicant",ApplicantID);
    setSelectedApplicant(ApplicantID);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);        
    setSelectedApplicant(null); 
  };


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

              {/* FATable moved down */}
              <section className="w-full max-w-8xl mt-36">
                <FATable data={pendingApplicants} onRowClick={(applicant) => handleRowClick(applicant)}/>
                {/* Conditionally render the modal when selectedApplicant exists */}
                {modalOpen && selectedApplicant && (
          <ClientModal
            data={selectedApplicant}
            isOpen={modalOpen}
            onClose={closeModal} // Pass the closeModal function
          /> 
            )}
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