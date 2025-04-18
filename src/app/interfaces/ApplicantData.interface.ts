import ApplicantStatus from "../enums/ApplicantStatus.enum";

interface ApplicantData {
    ApplicantID: string;
    ApplicationDate: number;
    BidAmount: 0;
    CVURL: string;
    EstimatedTimeline: 0;
    JobID: string;
    status: ApplicantStatus,
    date: number

}

export default ApplicantData;