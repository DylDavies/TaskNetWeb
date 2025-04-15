'use server'
import { Timestamp } from "firebase/firestore";
import JobData from "../../interfaces/JobData.interface";

// Helper function to convert deadline (firestore Date/Time) to something which TS can hopefully use
// I have no idea how to get around this
async function convertJobData(data: any): Promise<JobData>{
  return {
    title: data.title,
    description: data.description,
    budget: data.budget,
    deadline: (data.deadline as Timestamp).toDate(),
    skills: data.skills,
    status: data.status,
    hiredUId: data.hiredUId,
    clientUId: data.clientUId,
  };
}

export { convertJobData };
