'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ApplicantData from "../../interfaces/ApplicationData.interface";
import ApplicationStatus from "@/app/enums/ApplicationStatus.enum";
import { getUsername } from "./DatabaseService";

async function getApplicant(ApplicantID: string): Promise<ApplicantData | null> {
    const userDoc = await getDoc(doc(db, "applications", ApplicantID));

    if (!userDoc.exists()) return null;

    return userDoc.data() as ApplicantData;
};

// Fetch pending applicants Endpoint:
async function getPendingApplicants(JobID: string): Promise<ApplicantData[]>{
    const dbRef = collection(db,'applications'); 
    const pending = query(dbRef,where('Status', '==', ApplicationStatus.Pending), where('JobID', '==', JobID));

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

    return pendingApplicants;
};  

// Accept applicant Endpoint - Sets applicant status in database to 1 (permission granted)
async function acceptApplicant(aid:string):Promise<void>{
    const dbRef = doc(db,'applications', aid);

    await updateDoc(dbRef,{
        Status: ApplicationStatus.Approved
    });
};

// Reject applicant Endpoint - Sets applicant status in database to 2 (permission denied)
async function rejectApplicant(aid:string):Promise<void>{
    const dbRef = doc(db,'applications', aid);

    await updateDoc(dbRef,{
        Status: ApplicationStatus.Denied
    });
};


export { getApplicant, getPendingApplicants, acceptApplicant, rejectApplicant};