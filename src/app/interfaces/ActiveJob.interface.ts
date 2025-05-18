import JobData from "./JobData.interface";

// Job data with id of job aswell
interface ActiveJob {
    jobId: string; 
    jobData: JobData;
}

export default ActiveJob;