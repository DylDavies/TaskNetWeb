import ActiveJob from "./ActiveJob.interface";
import UserData from "./UserData.interface";

interface ChatLinkProps {
  job: ActiveJob;
  userData: UserData;
  currentUserId: string;
  children: React.ReactNode;
}

export default ChatLinkProps;