import { Timestamp } from "firebase/firestore";

interface ChatPreview{
    latestMessage: string,
    latestTime: Timestamp,
    unreadCount: number,
    senderUId: string,
}

export default ChatPreview;