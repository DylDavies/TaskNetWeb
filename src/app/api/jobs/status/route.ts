import JobStatus from "@/app/enums/JobStatus.enum";
import { db } from "@/app/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest){
    try{
        const { jobID, status }: { jobID: string; status: JobStatus} = await req.json();
        await updateDoc(doc(db, "Jobs", jobID), { status });

        return NextResponse.json({}, { status: 200 });
    }
    catch(error){
        return NextResponse.json({ message: "Error updating the job status", error}, { status: 500 });
    }
}