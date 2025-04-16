'use server'
import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";

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
    console.log("Job successfully created with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding job:", error);
    throw new Error("Failed to create job");
  }
}

// Add an endpoint for a freelancer to update hiredUid when they take a job
// Add an endpoint for a freelancer to update status when they take a job

export { getJob, createJob };
