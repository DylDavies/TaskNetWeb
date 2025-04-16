'use server'
import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import { addDoc, collection, doc, getDoc, getDocs } from "firebase/firestore";

// Endpoint to get the Job by its JobID
async function getJob(uid: string): Promise<JobData | null> {
  const jobDoc = await getDoc(doc(db, "Jobs", uid));

  if (!jobDoc.exists()) return null; 

  return jobDoc.data() as JobData;
}

// Endpoint to create a new Job:
async function createJob(jobData: JobData): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, "Jobs"), jobData);
    console.log("Job successfully created with ID:", docRef.id); // find out why this doesn't get displayed
    return docRef.id;
  } catch (error) {
    console.error("Error adding job:", error);
    throw new Error("Failed to create job");
  }
}

// Endpoint to get all jobs
async function getAllJobs(): Promise<{ jobs: JobData[]; jobIDs: string[] }> {
  try {
    const jobDocs = await getDocs(collection(db, "Jobs"));
    const jobs: JobData[] = [];
    const jobIDs: string[] = [];
    
    jobDocs.forEach((doc) => {
      jobs.push(doc.data() as JobData);
      jobIDs.push(doc.id);
    });
    
    return { jobs, jobIDs };
  } catch (error) {
    console.error("Error getting jobs:", error);
    throw new Error("Failed to get jobs");
  }
}

// Add an endpoint for a freelancer to update hiredUid when they take a job
// Add an endpoint for a freelancer to update status when they take a job

export { getJob, createJob, getAllJobs };
