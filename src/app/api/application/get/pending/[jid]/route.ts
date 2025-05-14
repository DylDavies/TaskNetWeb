import ApplicationStatus from "@/app/enums/ApplicationStatus.enum";
import { db } from "@/app/firebase";
import { getUsername } from "@/app/server/services/DatabaseService";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{jid: string}> }) {
    const dbRef = collection(db,'applications'); 
    const pending = query(dbRef,where('Status', '==', ApplicationStatus.Pending), where('JobID', '==', (await params).jid));

    const snapshot = await getDocs(pending);

    const pendingApplicants = snapshot.docs.map(doc => ({
        ApplicationID: doc.id,
        ApplicantID: doc.data().ApplicantID,
        ApplicationDate: doc.data().ApplicationDate,
        BidAmount: doc.data().BidAmount,
        CVURL: doc.data().CVURL,
        EstimatedTimeline: doc.data().EstimatedTimeline,
        JobID: doc.data().JobID,
        Status: doc.data().Status,
        username:getUsername(doc.data().ApplicantID)
    }));

    return NextResponse.json({results: pendingApplicants}, {status: 200});
}