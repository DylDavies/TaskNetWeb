import { db } from "@/app/firebase";
import FSNotification from "@/app/interfaces/FSNotification.interface";
import { fromDB } from "@/app/server/services/NotificationService";
import { and, collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";
import Notification from "@/app/interfaces/Notification.interface";

export async function GET(req: NextRequest, { params } : { params: { uid: string } }) {
    try {
        const snapshot = await getDocs(query(collection(db, "notifications"), and(where("uidFor", "==", params.uid), where("deleted", "==", false))));

        const results: Notification[] = [];
    
        snapshot.forEach(s => results.push(fromDB(s.data() as FSNotification)));

        return NextResponse.json({results}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error marking all notifications as seen", error}, { status: 500 });
    }
}