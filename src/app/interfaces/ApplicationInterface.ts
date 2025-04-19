import ApplicationStatus from "../enums/ApplicationStatus.enum"

interface ApplicationData {
    ApplicantID: string,
    ApplicationDate: number,
    BidAmount: number,
    CVURL: string,
    EstimatedTimeline: number,
    JobID: string,
    status: ApplicationStatus
}

export default ApplicationData;