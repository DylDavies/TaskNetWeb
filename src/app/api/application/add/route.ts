import ApplicationStatus from "@/app/enums/ApplicationStatus.enum";
import { db } from "@/app/firebase";
import { setDoc, doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

type data = {
    ApplicantID: string,
    BidAmount: number,
    CVURL: string,
    EstimatedTimeline: number,
    JobID:string,
    ApplicantionID: string,
    ApplicationDate: number
}

export async function POST(req: NextRequest) {
    try {
        const { ApplicantID, BidAmount, CVURL, EstimatedTimeline, JobID, ApplicantionID, ApplicationDate }: data = await req.json();

        await setDoc(doc(db, "applications", ApplicantionID), {
            ApplicantID: ApplicantID,
            ApplicationDate: ApplicationDate,
            BidAmount: BidAmount,
            CVURL: CVURL,
            EstimatedTimeline: EstimatedTimeline,
            JobID: JobID,
            Status: ApplicationStatus.Pending
        });

        return NextResponse.json({}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: "Error adding application", error}, {status: 500});
    }
}