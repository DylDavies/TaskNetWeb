import JobStatus from "../enums/JobStatus.enum";

// Info for a Job from Jobs collection
interface JobData{
    title: string,
    description: string,
    budget: number,
    deadline: Date, // Data | number
    skills: string[],
    status: JobStatus,
    hiredUId: string,
    clientUId: string, // added a new one
    // Should I add another for the date that this was created?
}

export default JobData;