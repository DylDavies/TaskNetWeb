import JobStatus from "../enums/JobStatus.enum";
import MilestoneStatus from "../enums/MilestoneStatus.enum";

// Info for a Job from Jobs collection
interface JobData{
    title: string,
    description: string,
    budgetMin: number,
    budgetMax: number,
    deadline: number, 
    skills: { 
        [skillArea: string]: string[]  // map with string as key and int array elements (element is the index of a skill)
    },
    status: JobStatus,
    hiredUId: string,
    clientUId: string, 
    createdAt:number, 
    milestones: {
        [title: string, description: string, status: MilestoneStatus, deadline: number, payment: number]:string []
    }
}

// Date as a number format: YYYYMMDD

export default JobData;