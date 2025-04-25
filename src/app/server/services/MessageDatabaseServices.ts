import { db } from "@/app/firebase";
import ActiveMessage from "@/app/interfaces/ActiveMessage.interface";
import MessageData from "@/app/interfaces/MessageData.interface";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

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

export { getAllMessages }