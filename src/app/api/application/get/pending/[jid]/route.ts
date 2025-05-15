import ApplicationStatus from "@/app/enums/ApplicationStatus.enum";
import { db } from "@/app/firebase";
import { collection, getDoc, getDocs, query, where, doc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{jid: string}> }) {
    const dbRef = collection(db,'applications'); 
    const pending = query(dbRef,where('Status', '==', ApplicationStatus.Pending), where('JobID', '==', (await params).jid));

    const snapshot = await getDocs(pending);

    const pendingApplicants = snapshot.docs.map(async dc => {
        const d = dc.data();
        const userDoc = await getDoc(doc(db, "users", d.ApplicantID))

        return {
            ApplicationID: dc.id,
            ApplicantID: dc.data().ApplicantID,
            ApplicationDate: dc.data().ApplicationDate,
            BidAmount: dc.data().BidAmount,
            CVURL: dc.data().CVURL,
            EstimatedTimeline: dc.data().EstimatedTimeline,
            JobID: dc.data().JobID,
            Status: dc.data().Status,
            username: userDoc.exists() ? userDoc.data().username || "No username" : "No username"
        }
    });

    return NextResponse.json({results: await Promise.all(pendingApplicants)}, {status: 200});
}