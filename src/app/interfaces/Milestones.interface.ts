import MilestoneStatus from "../enums/MilestoneStatus.enum";

interface MilestoneData {
    id: string;
    title: string;
    description: string;
    status: MilestoneStatus;
    deadline: number;
    payment: number;   
    reportURL: string;
}

export default MilestoneData;