'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ApplicantData from "../../interfaces/ApplicantData.interface";
import ApplicantStatus from "@/app/enums/ApplicantStatus.enum";
//import AuthService from "../../services/AuthService";

async function getApplicant(ApplicantID: string): Promise<ApplicantData | null> {
    const userDoc = await getDoc(doc(db, "applications", ApplicantID));

    if (!userDoc.exists()) return null;

    return userDoc.data() as ApplicantData;
};

// Fetch pending applicants Endpoint:
async function getPendingApplicants(): Promise<{aid:string; status:number, ApplicationDate: number, BidAmount: number, CVURL: string,EstimatedTimeline: number,JobID: string,}[]>{
    const dbRef = collection(db,'applications');  //db.collection('users');
    const pending = query(dbRef,where('status', '==', ApplicantStatus.Pending));

    const snapshot = await getDocs(pending);

    const pendingApplicants = snapshot.docs.map(doc => ({

        aid: doc.id,
        ApplicationDate: doc.data().ApplicationDate,
        BidAmount: doc.data().BidAmount,
        CVURL: doc.data().CVURL,
        EstimatedTimeline: doc.data().EstimatedTimeline,
        JobID: doc.data().JobID,
        status: doc.data().status
        
        
    }));

    console.log(pendingApplicants);

    return pendingApplicants;
};  

// Accept applicant Endpoint - Sets applicant status in database to 1 (permission granted)
async function acceptApplicant(aid:string):Promise<void>{
    const dbRef = doc(db,'applications', aid);

    await updateDoc(dbRef,{
        status:1, // 1 : Approve (temp)
    });
};

// Reject applicant Endpoint - Sets applicant status in database to 2 (permission denied)
async function rejectApplicant(aid:string):Promise<void>{
    const dbRef = doc(db,'applications', aid);

    await updateDoc(dbRef,{
        status:2, // 2 : Deny (temp)
    });
};


export { getApplicant, getPendingApplicants, acceptApplicant, rejectApplicant};