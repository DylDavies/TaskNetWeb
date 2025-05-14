import { db } from "@/app/firebase";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import { doc, setDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const { jobID, milestoneID, milestoneData }: { jobID: string, milestoneID: string, milestoneData: MilestoneData } = await req.json();

        const milestoneDocRef = doc(db, "Jobs", jobID, "milestones", milestoneID);
        await setDoc(milestoneDocRef, milestoneData);

        return NextResponse.json({}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Error setting milestone", error}, {status: 500});
    }
}