import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { jobID, milestoneID, status }: { jobID: string, milestoneID: string, status: number } = await req.json();

        const milestoneDocRef = doc(db, "Jobs", jobID, "milestones", milestoneID);
        await updateDoc(milestoneDocRef, {
            status: status,
        });

        return NextResponse.json({}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Error updating milestone status", error}, {status: 500});
    }
}