import { db } from "@/app/firebase";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import { addDoc, collection } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { jobID, milestoneData }: { jobID: string, milestoneData: MilestoneData } = await req.json();

        const milestoneCollectionRef = collection(db, "Jobs", jobID, "milestones");
        const milestoneDocRef = await addDoc(milestoneCollectionRef, milestoneData);
        
        return NextResponse.json({result: milestoneDocRef.id}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error adding milestone", error}, {status: 500});
    }
}