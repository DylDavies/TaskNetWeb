import { db } from "@/app/firebase";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import JobData from "@/app/interfaces/JobData.interface";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    try{
        const jobDocs = await getDocs(collection(db, "Jobs"));
        const activeJobs: ActiveJob[] = [];

        jobDocs.forEach((doc) => {
            const data = doc.data() as JobData;
            activeJobs.push({
                jobId: doc.id,
                jobData: data
            });
        });

        return NextResponse.json({ results: activeJobs }, { status: 200 });
    }
    catch(error){
        return NextResponse.json({ message: "Error getting all the jobs",error }, { status: 500 });
    }
}