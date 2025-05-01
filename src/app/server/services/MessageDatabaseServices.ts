import MessageStatus from "@/app/enums/MessageStatus.enum";
import MessageType from "@/app/enums/MessageType.enum";
import { db } from "@/app/firebase";
import ActiveMessage from "@/app/interfaces/ActiveMessage.interface";
import MessageData from "@/app/interfaces/MessageData.interface";
import { addDoc, collection, getDocs, limit, orderBy, query, serverTimestamp } from "firebase/firestore";

// Endpoint to get all messages for that certain job
async function getAllMessages(jobID: string): Promise<ActiveMessage[]>{
    try{
        const messagesRef = collection(db, "Jobs", jobID, "messages");
        const q = query(messagesRef, orderBy("DateTimeSent"), limit(20));

        const messagesDoc = await getDocs(q);
        const ActiveMessages: ActiveMessage[] = [];

        messagesDoc.forEach((doc)=> {
            const data = doc.data() as MessageData;
            ActiveMessages.push({
                MessageID: doc.id,
                messageData: data       
            });
        });
        return ActiveMessages;
    }
    catch (error){
        console.error("Error getting messages:", error);
        return [];
    }
}

// Function to send (create) a new message
async function sendMessage(jobID: string, message: Omit<MessageData, 'DateTimeSent'>) {
    try {
      const messagesRef = collection(db, "Jobs", jobID, "messages");
  
      await addDoc(messagesRef, {
        ...message, 
        DateTimeSent: serverTimestamp(), // Firebase will generate the timestamp
      });
  
    } catch (error) {
      console.error("Error sending message:", error);
    }
}

// Create a chat between 2 users 
async function createChat(jobID: string, jobName: string){
  try{
    const messagesRef = collection(db, "Jobs", jobID, "messages");

    const systemMessage: Omit<MessageData, 'DateTimeSent'> = {
      senderUId: "System",
      type: MessageType.System,
      status: MessageStatus.Delivered,
      message: `Chat created for ${jobName}! Ready to start chatting?`,
    };

    // message sender is from system
    await addDoc(messagesRef, {
      ...systemMessage,
      DateTimeSent: serverTimestamp(),
    });

  }
  catch (error){
    console.error("Error creating chat:", error);
  }
}

export { getAllMessages, sendMessage, createChat }