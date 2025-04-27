import UserType from "../enums/UserType.enum";
import ActiveMessage from "./ActiveMessage.interface";
import JobWithUser from "./JobWithOtherUser.interface";

interface ChatStore {
    jobsWithUsers: JobWithUser[];
    activeConversation: JobWithUser | null;
    messages: ActiveMessage[];
    isLoadingJobs: boolean;
    isLoadingMessages: boolean;
  
    fetchJobsWithUsers: (uid: string, userType:UserType) => void;
    setActiveConversation: (jobWithUser: JobWithUser) => void;
    clearMessages: () => void;
  }

export default ChatStore;
