import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { jobID, milestoneID, reportURL }: { jobID: string, milestoneID: string, reportURL: string } = await req.json();

        const milestoneDocRef = doc(db, "Jobs", jobID, "milestones", milestoneID);
        await updateDoc(milestoneDocRef, {
            reportURL: reportURL,
        });

        return NextResponse.json({}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Error adding milestone report url", error}, {status: 500});
    }
}