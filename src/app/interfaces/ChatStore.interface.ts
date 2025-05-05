import UserType from "../enums/UserType.enum";
import ActiveMessage from "./ActiveMessage.interface";
import JobWithUser from "./JobWithOtherUser.interface";
import MessageData from "./MessageData.interface";
import { Timestamp, Unsubscribe } from "firebase/firestore"; 
import JobData from "./JobData.interface";

interface ChatStore {
    jobsWithUsers: JobWithUser[];
    activeConversation: JobWithUser | null;
    messages: ActiveMessage[];
    isLoadingJobs: boolean;
    isLoadingMessages: boolean;
    unsubscribe: Unsubscribe | null; 
    globalUnsubscribe: Unsubscribe | null;
    jobMap: { [jobId: string]: JobData };
    listenerInitialized: boolean;  
    conversationWasManuallySet: boolean;
  
    fetchJobsWithUsers: (uid: string, userType:UserType) => void;
    setActiveConversation: (jobWithUser: JobWithUser | null, currentUserUId: string) => void;
    clearMessages: () => void;

    chatPreviews: {
        [jobId: string]: {
          latestMessage: string;
          latestTime: Timestamp; 
          senderUId: string;
          unreadCount: number;
        };
      };
      setChatPreview: (jobId: string, message: MessageData, currentUserUId: string, unreadCountOverride?: number) => void;
    clearUnreadCount: (jobId: string) => void;
    setupGlobalMessageListener: (uid: string) => void; // listen for new messages in background
    setConversationWasManuallySet: (value: boolean) => void;
}

export default ChatStore;