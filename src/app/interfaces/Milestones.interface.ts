import MilestoneStatus from "../enums/MilestoneStatus.enum";
import PaymentStatus from "../enums/PaymentStatus.enum";

interface MilestoneData {
    id: string;
    title: string;
    description: string;
    status: MilestoneStatus;
    deadline: number;
    payment: number;   
    reportURL: string;
    paymentStatus: PaymentStatus;
}

export default MilestoneData;