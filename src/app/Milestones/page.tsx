"use client";

import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import "../components/button/Button.css";
import React, { useContext, useEffect, useState } from "react";
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
import RateUserModal from "../components/RatingModal/RateUserModal";
import UserData from "../interfaces/UserData.interface";
import { getUser } from "../server/services/DatabaseService";
import { getUsername } from "../server/services/DatabaseService";
import Button from "../components/button/Button";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase";
import { getMilestones } from "../server/services/MilestoneService";
import { getApplicant } from "../server/services/ApplicationDatabaseServices";
import toast from "react-hot-toast";

/*This page shows the milestones for a job and is viewed by both the freelancer and client, however both interact differently with the page*/

const linksClient = [
  { name: "Home", href: "/client", selected: false },
  { name: "Chat", href: "/chat", selected: false },
];

const linksFreelancer = [
  { name: "Home", href: "/freelancer", selected: false },
  { name: "Chat", href: "/chat", selected: false },
];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;
  const { jobID } = useContext(JobContext) as JobContextType;
  const [selectedMilestone, setSelectedMilestone] = useState<MilestoneData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [job, setJob] = useState<JobData>();
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);
  const [userToRate, setUserToRate] = useState<UserData | null>(null);
  const [ratedName, setRatedName] = useState("");
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  
  //Refetches information for the page so no need to refresh when something changes
  function refetch() {
    setRefreshFlag((prev) => !prev);
  }

  //This function fetches the data of the user to be rated
  useEffect(() => {
    async function fetchUserToRate() {
      if (!job) return;
      
      // Determine who should be rated based on current user type
      const uidToRate = user?.userData.type === UserType.Client 
        ? job.hiredUId 
        : job.clientUId; 
  
      if (uidToRate) {
        const userData = await getUser(uidToRate);
        setUserToRate(userData);
      }
    }
  
    fetchUserToRate();
  }, [job, user]);

  //This function fetches the username of the user to be rated
  useEffect(() => {
    const fetchUsername = async () => {
      if (userToRate && job?.hiredUId && job?.clientUId) {
        const name = await getUsername(
          user?.userData.type === UserType.Client ? job.hiredUId : job.clientUId
        );
        setRatedName(name);
      }
    };
    fetchUsername();
  }, [userToRate, job, user]);

  //This function converts the user type to a string to be displayed in the header
  function userTypeToString(value: UserType | undefined): string {
    if (value === undefined) return "Unknown";
    return UserType[value] || "...";
  }
  const userTypeNum = user?.userData.type;
  const userTypeString = userTypeToString(userTypeNum);

  //depending on the usertype, the links on the sidebar will be different
  const links =
    user?.userData.type === UserType.Client ? linksClient : linksFreelancer;

  const [jobTitle, setJobTitle] = useState<string>("");
  const [clientUID, setClientUID] = useState<string>("");

  //To set the job title of the page
  useEffect(() => {
    async function fetchJobTitle() {
      try {
        const job = await getJob(jobID as string);
        if (job) {
          setJobTitle(job.title);
          setClientUID(job.clientUId); // assumes title exists
          setJob(job);
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
      }
    }

    if (jobID) {
      fetchJobTitle();

      const unsub = onSnapshot(doc(db, "Jobs", jobID as string), (ss) => {
        setJob(ss.data() as JobData)
      });
  
      return () => {
        if (unsub) unsub();
      }
    }
  }, [jobID]);

  //This function opens the modal to view milestone information when clicking on a milestone in the table
  function handleMilestoneClick(milestone: MilestoneData) {
    setModalOpen(true);
    setSelectedMilestone(milestone);
  }

  //This function updates the milestones page when the client is finished adding milestones so the freelancer can begin working
  async function handleProceedJob() {
    if (jobID && job?.hiredUId ) {
      try {
        
        const milestonesForJob = await getMilestones(jobID);
        const freelancerApplication = await getApplicant(job.hiredUId)
      
        const totalPayment = milestonesForJob.reduce((sum, milestone) => {
          return sum + (milestone.payment || 0);
        }, 0);

        //Making sure the total amount the freelancer is getting paid is equal to or greater than the freelancers bid on their application
        if(freelancerApplication){
          if(totalPayment < freelancerApplication?.BidAmount){
            toast.error(`The total payment should be equal to or more than the freelancers bid amount of ${freelancerApplication.BidAmount}`)
            return
          }
        }
        
        
        await updateJobStatus(jobID, JobStatus.InProgress);
        toast.success("The freelancer can now proceed with the job")
        
      } catch (error) {
        console.error("Error proceeding with job:", error);
        // Handle error appropriately (show notification, etc.)
      }
    }
  }

  // Calculate the jobs progress
  const completedCount = milestones.filter(
    (m) => m.status === 3
  ).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  //If the job is completed, the user get prompted to rate the person they were working with on a job
  useEffect(() =>{
    if(job && job.status === JobStatus.Completed && jobID){
      const showFreelancerRating = user?.userData.type === UserType.Freelancer && !job.hasFreelancerRated
      if(showFreelancerRating){
        
        setIsRatingModalOpen(true)  
      }

      const showClientRating = user?.userData.type === UserType.Client && !job.hasClientRated
      if(showClientRating){
        
        setIsRatingModalOpen(true)
        
      }
    }
  }, [job, jobID, user, refreshFlag]);

  //If the progress bar is full, that means the job is completed and so the job status changes to completed and client is sent a notification
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
          const updatedJob = await getJob(jobID);
          if (updatedJob) {
            setJob(updatedJob);
          } else {
            console.error("Failed to fetch updated job data");
          }

          await createNotification({
            message: `${job.title} - has been completed.`,
            seen: false,
            uidFor: clientUID,
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
          {/*Header depending on the user type*/}
          <Header
            name={user?.userData.username || "..."}
            usertype={userTypeString}
          />
        </header>

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">
              <section className="px-6 py-4 bg-gray-800 text-black shadow rounded-xl m-4">
                <h1 className="text-2xl font-semibold text-gray-300">
                  Milestones for{" "}
                  <strong className="">{jobTitle || "..."}</strong>
                </h1>
              </section>
              <section className="mt-4 w-full flex flex-col items-center ">
                
                {/*Progress bar display*/}
                <p className="text-gray-300 mb-2 max-w-4xl flex justify-center ">
                  Progress: {progress}% ({completedCount}/{milestones.length}{" "}
                  milestones)
                </p>
                <MilestoneProgressBar progress={progress} />
              </section>
              <section>
                {/*Instruction on the page is different depending on user type*/}
                <h2 className="text-xl font-semibold text-gray-300">
                  {user?.userData.type === UserType.Client
                    ? "Click on a milestone to see more information and review progress"
                    : user?.userData.type === UserType.Freelancer
                    ? "Click on a milestone to see more information and edit progress"
                    : ""}
                </h2>
              </section>

              <section className="w-full max-w-8xl flex justify-start mb-4 cursor-pointer ">
                {/*Rating modal is different depending on the user type*/}
              {
                userToRate && 
                ((user?.userData.type === UserType.Freelancer && job?.clientUId &&!job.hasFreelancerRated  )) && (
                  <RateUserModal 
                    data={userToRate} 
                    uid={ job?.clientUId}
                    ratedName={ratedName}
                    isOpen={isRatingModalOpen}
            
                  />
                )
              }
              { 
                userToRate && 
                ((user?.userData.type === UserType.Client && job?.hiredUId &&!job.hasClientRated )  ) && (
                  <RateUserModal 
                    data={userToRate} 
                    uid={ job?.hiredUId}
                    ratedName={ratedName}
                    isOpen={isRatingModalOpen}
                  />
                )
              }
              </section>

      <section className="w-full max-w-8xl flex justify-start mb-4 cursor-pointer flex-col space-y-4">
        {/*Only Clients and or admins can create milestones*/}
        {((user?.userData.type === UserType.Client || user?.userData.type === UserType.Admin) && (job && job.status === JobStatus.Employed)) && (
          <>
            <CreateMilestone refetch={refetch} />
          </>
          )}
        </section>


              <section className="w-full max-w-8xl mt-12">
                {job && (
                  <MilestonesTable
                    data={job}
                    onMilestoneClick={handleMilestoneClick}
                    refresh={refreshFlag}
                    milestones={milestones}
                    setMilestones={setMilestones}
                  />
                )}
              </section>
              {selectedMilestone && modalOpen && jobID && (
                <ViewMilestones
                  data={{
                    jobId: jobID,
                    jobStatus:job!.status,
                    clientUID: clientUID,
                    milestone: selectedMilestone,
                  }}
                  onClose={() => setSelectedMilestone(null)}
                  onUpload={() => {}}
                  modalIsOpen={modalOpen}
                  refetch={refetch}
                ></ViewMilestones>
              )}

            </section>
            {((user?.userData.type === UserType.Client || user?.userData.type === UserType.Admin) && milestones.length > 0)  && (job && job.status === JobStatus.Employed) && (
              <section className="w-full max-w-8xl flex justify-end mt-4">
                <Button caption="Proceed with Job" onClick={handleProceedJob} />
                </section>
          )}

          </section>
          
        </main>

        <footer className="bg-[#f75509] py-4 flex justify-center bg-gray-900 box-footer">
          <p>© {new Date().getFullYear()} tasknet.tech</p>
        </footer>
      </section>
    </>
  );
}
