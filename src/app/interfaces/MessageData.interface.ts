import { Timestamp } from "firebase/firestore";
import MessageStatus from "../enums/MessageStatus.enum";
import MessageType from "../enums/MessageType.enum";

interface MessageData{
    senderUId: string,
    type: MessageType,
    status: MessageStatus,
    message: string,
    DateTimeSent: Timestamp // Maybe can update it to be a number like 2025/04/25 at 16:00 --> 202504251600
}

export default MessageData;