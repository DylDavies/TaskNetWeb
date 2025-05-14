import ApplicationStatus from "@/app/enums/ApplicationStatus.enum";
import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{aid: string}> }) {
    try {
        const dbRef = doc(db,'applications', (await params).aid);

        await updateDoc(dbRef,{
            Status: ApplicationStatus.Approved
        });

        return NextResponse.json({}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Error accepting applicant", error}, {status: 500});
    }
}