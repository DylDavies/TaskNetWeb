import ActiveJob from "./ActiveJob.interface";
import UserData from "./UserData.interface";

// stores the Active JobData and the userData of the other user that is not the ActiveUser
interface JobWithUser {
    job: ActiveJob;
    userData: UserData | null;
}

export default JobWithUser;
