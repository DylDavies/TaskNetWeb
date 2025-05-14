import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../firebase";
import { addDoc, collection, setDoc } from "firebase/firestore";
import Notification from "@/app/interfaces/Notification.interface";
import { toDB } from "@/app/server/services/NotificationService";

export async function POST(req: NextRequest) {
    try {
        const notificationData: Omit<Notification, "uid" | "sentTime" | "deleted"> = await req.json();

        const docRef = await addDoc(collection(db, "notifications"), notificationData);
    
        const data: Notification = { uid: docRef.id, sentTime: new Date(), deleted: false, ...notificationData };
    
        await setDoc(docRef, toDB(data));
    
        return NextResponse.json({}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error creating notification", error}, { status: 500 })
    }
}