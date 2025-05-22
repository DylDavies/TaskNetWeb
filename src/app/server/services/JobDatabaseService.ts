import JobStatus from "@/app/enums/JobStatus.enum";
import UserType from "@/app/enums/UserType.enum";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import JobData from "@/app/interfaces/JobData.interface";
import formatDateAsNumber from "../formatters/FormatDates";

// Endpoint to get the Job by its JobID
async function getJob(jid: string): Promise<JobData | null> {
  const response = await fetch(`/api/jobs/${jid}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) console.error("Failed to get job");
  return (await response.json()).result;
}

// Endpoint to create a new Job:
async function createJob(jobData: JobData): Promise<string> {
  const response = await fetch(`/api/jobs/create`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(jobData)
  });

  if (response.status == 500) console.error(await response.json());
  return (await response.json()).id;
}

// Endpoint to get all jobs
async function getAllJobs(): Promise<ActiveJob[]>{
  const response = await fetch(`/api/jobs/all`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json'},
  });

  if (!response.ok) console.error("Failed to get all jobs");
  return (await response.json()).results;
}


// Endpoint to Update job status
async function updateJobStatus(jobID: string,  status : JobStatus) {
  const response = await fetch("/api/jobs/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobID, status })
  });

  if (!response.ok) console.error("Failed to update the job status");
}


// Endpoint to Update hiredUId
async function updateHiredUId(jobID: string, hiredUId: string) {
  const response = await fetch('/api/jobs/hired', {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobID, hiredUId })
  });

  if (!response.ok) console.error("Failed to update hiredUId");
}

//Endpoint to Search Jobs by title:
async function searchByTitle(title: string): Promise<JobData[]> {
  const response = await fetch(`/api/jobs/search/title?title=${encodeURIComponent(title)}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Failed to search jobs by title");
  return (await response.json()).results;
}


// Endpoint to get jobs that have those skills (needs skillID or skillArea to be passed in to work)
async function searchJobsBySkills(skills: string[], skillIds: string[]): Promise<JobData[]> {
  const response = await fetch('/api/jobs/search/skills', {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skills, skillIds })
  });

  if (!response.ok) throw new Error("Failed to search jobs by skills");
  return (await response.json()).results;
}

// Endpoint to get jobs for a given clientID
async function getJobsByClientID(clientID: string): Promise<ActiveJob[]> {
  const response = await fetch(`/api/jobs/client/${clientID}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Failed to get jobs by client ID");
  return (await response.json()).results;
}

// Endpoint to get clients and freelancers who matched on the same job/s
async function getJobByClientIdAndHiredId(clientID: string, hiredID: string): Promise<JobData[]> {
  const response = await fetch(`/api/jobs/client/${clientID}?hiredId=${hiredID}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Failed to get jobs by client and hired ID");
  return (await response.json()).results;
}

// Endpoint to get ActiveJobData for clients and freelancers who are working together on the same job
async function getContracted(userID: string, userType: UserType): Promise<ActiveJob[]> {
  const response = await fetch(`/api/jobs/contracted?userId=${userID}&userType=${userType}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Failed to get contracted jobs");
  return (await response.json()).results;
}

async function getJobsByFreelancerID(FreelancerID: string): Promise<ActiveJob[]> {
  const response = await fetch(`/api/jobs/freelancer/${FreelancerID}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Failed to get jobs by freelancer ID");
  return (await response.json()).results;
}

async function getJobsBydate(startDate: Date, endDate: Date): Promise<ActiveJob[]>{

  const startDateNum = formatDateAsNumber(startDate);
  const endDateNum = formatDateAsNumber(endDate);

  const response = await fetch(`/api/jobs/date?startDate=${startDateNum}&endDate=${endDateNum}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.ok) throw new Error("Failed to get jobs by date");
  return (await response.json()).results;
 }

export {getJobsBydate, getJob, createJob, getAllJobs, searchByTitle, updateHiredUId, updateJobStatus, searchJobsBySkills, getJobsByClientID, getJobByClientIdAndHiredId, getContracted, getJobsByFreelancerID };
