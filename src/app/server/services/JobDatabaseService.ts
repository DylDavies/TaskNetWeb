'use server'
import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { convertJobData } from "./ConvertFirestoreJobDataToTS";


// Endpoint to get the Job by its JobID
async function getJob(uid: string): Promise<JobData | null> {
  const jobDoc = await getDoc(doc(db, "Jobs", uid));

  if (!jobDoc.exists()) return null; 

  return convertJobData(jobDoc.data() as JobData);
}

export { getJob };
