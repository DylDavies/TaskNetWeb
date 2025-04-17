import JobData from "./JobData.interface";

// For UID of the job you are on aswell as the data
interface ActiveJob {
    jobId: string; 
    jobData: JobData;
}

export default ActiveJob;