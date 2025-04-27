import MilestoneStatus from "../enums/MilestoneStatus.enum";

interface MilestoneData {
    title: string;
    description: string;
    status: MilestoneStatus;
    deadline: number;
    payment: number;   
}

export default MilestoneData;