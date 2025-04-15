'use server'
import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import { doc, getDoc } from "firebase/firestore";

// Endpoint to get the Job by its JobID
async function getJob(uid: string): Promise<JobData | null> {
  const jobDoc = await getDoc(doc(db, "Jobs", uid));

  if (!jobDoc.exists()) return null; 

  return jobDoc.data() as JobData;
}

export { getJob };
