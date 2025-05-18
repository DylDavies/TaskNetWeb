import PaymentStatus from "@/app/enums/PaymentStatus.enum";
import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    try {
        const { jobID, milestoneID, status }: { jobID: string, milestoneID: string, status: PaymentStatus } = await req.json();

        const milestoneDocRef = doc(db, "Jobs", jobID, "milestones", milestoneID);
        await updateDoc(milestoneDocRef, {
          paymentStatus: status
        })

        return NextResponse.json({}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Error setting milestone payment status", error}, {status: 500});
    }
}