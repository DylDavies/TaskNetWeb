import ApplicantionStatus from "../enums/ApplicantionStatus.enum";

interface ApplicantionData {
    ApplicantID: string;
    ApplicationDate: number;
    BidAmount: number;
    CVURL: string;
    EstimatedTimeline: number;
    JobID: string;
    Status: ApplicantionStatus,

}

export default ApplicantionData;