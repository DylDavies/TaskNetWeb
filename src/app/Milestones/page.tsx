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
import { getJob, updateJobStatus } from "../server/services/JobDatabaseService";
import { JobContext, JobContextType } from "../JobContext";
import UserType from "../enums/UserType.enum";
import MilestonesTable from "../components/MilestonesTable.tsx/MilestonesTable";
import CreateMilestone from "../components/CreateMilestone/CreateMilestone";
import MilestoneData from "../interfaces/Milestones.interface";
import ViewMilestones from "../components/viewMilestoneFreelancer/viewMilestoneFreelancer";
import MilestoneProgressBar from "../components/MilestoneProgressBar/MilestoneProgressBar";
import JobData from "../interfaces/JobData.interface";
import JobStatus from "../enums/JobStatus.enum";
import { createNotification } from "../server/services/NotificationService";

const linksClient = [
  { name: "back", href: "/client" }];

const linksFreelancer = [
    { name: "back", href: "/freelancer" }
]
const linksAdmin = [
    {name: "Admin Dashboard", href: "/admin"},
    {name: "Admin client view", href: "/client"},
    {name: "Admin freelancer view", href: "/freelancer"}
]


export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const { jobID } = useContext(JobContext) as JobContextType;
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [job, setJob] = useState<JobData>();
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);
  
  function refetch() {
    setRefreshFlag(prev => !prev);
  }

  //This function converts the usetype to a string to be displayed in the header
  function userTypeToString(value: UserType| undefined): string {
    if (value === undefined) return 'Unknown';
    return UserType[value] || '...';
    }
    const userTypeNum = user?.userData.type
    const userTypeString = userTypeToString(userTypeNum)

    const links = 
    user?.userData.type === UserType.Admin ? linksAdmin :
    user?.userData.type === UserType.Client ? linksClient : 
     linksFreelancer;

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
      AuthService.googleSignout();
     router.push("/");
  }

  const [jobTitle, setJobTitle] = useState<string>("");
  const [clientUID, setClientUID] = useState<string>("")

  

  //To set the job title of the page
  useEffect(() => {
    async function fetchJobTitle() {
      try {
        const job = await getJob(jobID as string);
        if (job) {
          setJobTitle(job.title);
          setClientUID(job.clientUId) // assumes title exists
          setJob(job)
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    }
  
    fetchJobTitle();
  }, []);

  function handleMilestoneClick(milestone : MilestoneData) {
    setModalOpen(true);
    setSelectedMilestone(milestone);
  }
  
  // Calculate progress
  const completedCount = milestones.filter(m => m.status === 3 || m.status === 2).length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  useEffect(() => {
    if (
      progress === 100 &&
      job &&
      job.status !== JobStatus.Completed &&
      jobID &&
      clientUID &&
      !hasNotifiedCompletion
    ) {
      const completeJob = async () => {
        try {
          await updateJobStatus(jobID, JobStatus.Completed);
  
          await createNotification({
            message: `${job.title} - has been completed.`,
            seen: false,
            uidFor: clientUID
          });
  
          setHasNotifiedCompletion(true);
        } catch (error) {
          console.error("Error completing job or sending notification:", error);
        }
      };
  
      completeJob();
    }
  }, [progress, job, jobID, clientUID, hasNotifiedCompletion]);

  

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full">
          <Header name={user?.userData.username || "..."} usertype= {userTypeString } />
        </header>

        

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">

              <section className="px-6 py-4 bg-gray-800 text-black shadow rounded-xl m-4">
                <h1 className="text-2xl font-semibold text-gray-300">
                    Milestones for <strong className="">{jobTitle || "..."}</strong>
                </h1>
              </section>
              <section className="mt-4 w-full flex flex-col items-center ">
                  <p className="text-gray-300 mb-2 max-w-4xl flex justify-center ">
                  Progress: {progress}% ({completedCount}/{milestones.length} milestones)
                  </p>
                    <MilestoneProgressBar progress={progress} />
                </section>
              <section>
                <h2 className="text-xl font-semibold text-gray-300">
                    {user?.userData.type === UserType.Client
                    ? "Click on a milestone to see more information and review progress"
                    : user?.userData.type === UserType.Freelancer
                    ? "Click on a milestone to see more information and edit progress"
                    : ""}
              </h2>
              </section>

            <section className="w-full max-w-8xl flex justify-start mb-4 cursor-pointer ">
                {(user?.userData.type === UserType.Client || user?.userData.type === UserType.Admin) && (
                <CreateMilestone refetch={refetch}  />
                )}
            </section>
               

              <section className="w-full max-w-8xl mt-12">
                {job && (
                    <MilestonesTable data={job} onMilestoneClick={handleMilestoneClick} refresh={refreshFlag} milestones={milestones} setMilestones={setMilestones} />
                )
                }
                
              </section>
              {selectedMilestone && modalOpen && jobID && (
                <ViewMilestones
                data = {{jobId: jobID, clientUID: clientUID, milestone: selectedMilestone}}
                onClose={() => setSelectedMilestone(null)}
                onUpload={() => {console.log("upload")}}
                modalIsOpen={modalOpen}
                refetch={refetch}>
                </ViewMilestones>
              )}
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