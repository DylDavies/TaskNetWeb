'use server'
import JobStatus from "@/app/enums/JobStatus.enum";
import { db } from "@/app/firebase";
import JobData from "@/app/interfaces/JobData.interface";
import { addDoc, and, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";

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


// Endpoint to Update job status
async function updateJobStatus(jobID: string,  status : JobStatus) {
  try{
    await updateDoc(doc(collection(db,"Jobs"),jobID),{
      status: status
    });
  } 
  catch(error){
    console.error("Error occurred when trying to update status: ", error);
  } 
}


// Endpoint to Update hiredUId
async function updateHiredUId(jobID: string, hiredUId:string){
  try{
    await updateDoc(doc(collection(db,"Jobs"),jobID),{
      hiredUId: hiredUId
    });
  }
  catch(error){
    console.error("Error occurred when trying to update hiredUId: ", error)
  }
}

//Endpoint to Search Jobs by title:
async function searchByTitle(title: string): Promise<JobData[]> {
  try {

    const Query = query(collection(db,"Jobs"), where("title","==",title));
    const jobDocs = await getDocs(Query);

    const jobs: JobData[] = [];

    jobDocs.forEach((doc) => {
      jobs.push(doc.data() as JobData);
    });

    return jobs;
    
    }  catch (error) {
    console.error("Error searching jobs by title:", error);
    throw error;
  }
}

// There must be another way to do this (for now leave it as it works):
// Endpoint to get jobs that have those skills (needs skillID or skillArea to be passed in to work)
async function searchJobsBySkills(skills: string[], skillIds: string[]): Promise<JobData[]> {
  try {
    if (!skills || skills.length === 0 || !skillIds || skillIds.length === 0) {
      throw new Error("Skills and skillIds must be provided");
    }

    const jobDocs = await getDocs(collection(db, "Jobs"));
    const matchingJobs: JobData[] = [];

    jobDocs.forEach((doc) => {
      const job = doc.data() as JobData;

      const jobSkillsMap = job.skills || {};

      const relevantSkillArrays = skillIds
        .filter((id) => jobSkillsMap[id]) 
        .map((id) => jobSkillsMap[id]);

      const relevantSkills = relevantSkillArrays.flat();

      const hasMatch = skills.some(skill => relevantSkills.includes(skill));
      if (hasMatch) {
        matchingJobs.push(job);
      }
    });

    return matchingJobs;
  } catch (error) {
    console.error("Error searching jobs by skills:", error);
    throw error;
  }
}

// Endpoint to get jobs for a given clientID
async function getJobsByClientID(clientID: string): Promise<JobData[]> {
  try {
    const Query = query(
      collection(db, "Jobs"),
      where("clientUId", "==", clientID)  
    );
    const jobDocs = await getDocs(Query);

    const jobs: JobData[] = [];

    jobDocs.forEach((doc) => {
      jobs.push(doc.data() as JobData);
    });

    return jobs;
    
  } catch (error) {
    console.error("Error getting jobs by client ID:", error);
    throw error;
  }
}

// Endpoint to get clients and freelancers who matched on the same job/s
async function getJobByClientIdAndHiredId(clientID: string, hiredID: string): Promise<JobData[]> {
  try {
    if (!clientID || !hiredID) {
      throw new Error("Both clientID and hiredID must be provided");
    }

    const Query = query(
      collection(db, "Jobs"),
      and(
        where("clientUId", "==", clientID),
        where("hiredUId", "==", hiredID)
      )
    );

    const jobDocs = await getDocs(Query);
    const jobs: JobData[] = [];

    jobDocs.forEach((doc) => {
      jobs.push(doc.data() as JobData);
    });

    return jobs;
  } catch (error) {
    console.error("Error fetching jobs by client and hired ID:", error);
    throw error;
  }
}

export { getJob, createJob, getAllJobs, searchByTitle, updateHiredUId, updateJobStatus, searchJobsBySkills, getJobsByClientID, getJobByClientIdAndHiredId };
