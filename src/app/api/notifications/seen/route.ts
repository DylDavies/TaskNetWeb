import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { uid, seen }: { uid: string, seen: boolean } = await req.json();

        await updateDoc(doc(db, "notifications", uid), {
            seen
        });

        return NextResponse.json({}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error marking notification as seen", error}, { status: 500 })
    }
}