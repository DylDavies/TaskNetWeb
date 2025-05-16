import { db } from "@/app/firebase";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import MessageType from "@/app/enums/MessageType.enum";
import MessageStatus from "@/app/enums/MessageStatus.enum";
import MessageData from "@/app/interfaces/MessageData.interface";

export async function POST(req: NextRequest) {
    try{
        const { jobID, jobName }: { jobID: string; jobName: string } = await req.json();

        const messagesRef = collection(db, "Jobs", jobID, "messages");
        const systemMessage: Omit<MessageData, 'DateTimeSent'> = {
            senderUId: "System",
            type: MessageType.System,
            status: MessageStatus.Delivered,
            message: `Chat created for ${jobName}! Ready to start chatting?`,
        };

        await addDoc(messagesRef, systemMessage);

        return NextResponse.json(
            { success: true },
            { status: 200 }
        );
    }
    catch (error) {
        return NextResponse.json(
            { message: "Error creating chat", error },
            { status: 500 }
        );
    }
}