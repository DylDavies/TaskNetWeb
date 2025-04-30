import UserType from "../enums/UserType.enum";
import ActiveMessage from "./ActiveMessage.interface";
import JobWithUser from "./JobWithOtherUser.interface";
import MessageData from "./MessageData.interface";
import ChatPreview from "./ChatPreview.interface";
import { Unsubscribe } from "firebase/firestore"; // Import the Unsubscribe type from Firestore

interface ChatStore {
    jobsWithUsers: JobWithUser[];
    activeConversation: JobWithUser | null;
    messages: ActiveMessage[];
    isLoadingJobs: boolean;
    isLoadingMessages: boolean;
    unsubscribe: Unsubscribe | null; // Add this line
  
    fetchJobsWithUsers: (uid: string, userType:UserType) => void;
    setActiveConversation: (jobWithUser: JobWithUser | null) => void;
    clearMessages: () => void;

    chatPreviews: Record<string, ChatPreview>; // JobID is the key for string
    setChatPreview: (jobId: string, message: MessageData) => void;
    clearUnreadCount: (jobId: string) => void;
    setupGlobalMessageListener: (uid: string) => void; // listen for new messages in background
}

export default ChatStore;