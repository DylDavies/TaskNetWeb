import { db } from "@/app/firebase";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import { collection, getDocs } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ jid: string }> }) {
    try {
        const milestoneCollectionRef = collection(db, "Jobs", (await params).jid, "milestones");
        const milestoneSnapshot = await getDocs(milestoneCollectionRef);

        const milestones: MilestoneData[] = [];
        milestoneSnapshot.forEach((doc) => {
            milestones.push({
            id: doc.id,
            ...(doc.data() as Omit<MilestoneData, "id">)
            });
        });

        return NextResponse.json({results: milestones}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error fetching milestones", error}, {status: 500});
    }
}