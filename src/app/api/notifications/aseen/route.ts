import { db } from "@/app/firebase";
import { doc, writeBatch } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { uids }: { uids: string[] } = await req.json();

        const batch = writeBatch(db);

        for (const uid of uids) {
            const dc = doc(db, "notifications", uid);
    
            batch.update(dc, {
                seen: true
            });
        }

        await batch.commit();

        return NextResponse.json({}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error marking all notifications as seen", error}, { status: 500 })
    }
}