import { db } from "@/app/firebase";
import MessageData from "@/app/interfaces/MessageData.interface";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
    try{
        const { jobID, message }: { jobID: string; message: Omit<MessageData, 'DateTimeSent'> } = await req.json();

        const messageRef = collection(db, "Jobs", jobID, "messages");
        const docRef = await addDoc(messageRef, {
            ...message,
            DateTimeSent: serverTimestamp()
        });

        return NextResponse.json(
            { id: docRef.id, success: true },
            { status: 200 }
        );
    }
    catch(error) {
        return NextResponse.json(
            { message: "Error sending message", error },
            { status: 500 }
        );
    }

}