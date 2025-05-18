import ApplicationStatus from "../enums/ApplicationStatus.enum";

interface ApplicationData {
    ApplicationID: string;
    ApplicantID: string;
    ApplicationDate: number;
    BidAmount: number;
    CVURL: string;
    EstimatedTimeline: number;
    JobID: string;
    Status: ApplicationStatus;
    username: string;
}

export default ApplicationData;