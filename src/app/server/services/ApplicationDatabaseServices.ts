'use server';

import { getDoc, doc, collection, where, query, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import ApplicantData from "../../interfaces/ApplicantData.interface";
import ApplicantionStatus from "@/app/enums/ApplicantionStatus.enum";
import { getUsername } from "./DatabaseService";

async function getApplicant(ApplicantID: string): Promise<ApplicantData | null> {
    const userDoc = await getDoc(doc(db, "applications", ApplicantID));

    if (!userDoc.exists()) return null;

    return userDoc.data() as ApplicantData;
};

// Fetch pending applicants Endpoint:
async function getPendingApplicants(JobID: string): Promise<{applicationid:string; Status:number, ApplicationDate: number, BidAmount: number, CVURL: string,EstimatedTimeline: number,JobID: string,username:Promise<string>}[]>{
    const dbRef = collection(db,'applications'); 
    const pending = query(dbRef,where('Status', '==', ApplicantionStatus.Pending), where('JobID', '==', JobID));
    console.log(pending)

    const snapshot = await getDocs(pending);

    const pendingApplicants = snapshot.docs.map(doc => ({

        applicationid: doc.id,
        ApplicationDate: doc.data().ApplicationDate,
        BidAmount: doc.data().BidAmount,
        CVURL: doc.data().CVURL,
        EstimatedTimeline: doc.data().EstimatedTimeline,
        JobID: doc.data().JobID,
        Status: doc.data().Status,
        username: getUsername(doc.data().ApplicantID)
        
        
    }));

    console.log("poes",pendingApplicants);

    return pendingApplicants;
};  

// Accept applicant Endpoint - Sets applicant status in database to 1 (permission granted)
async function acceptApplicant(aid:string):Promise<void>{
    const dbRef = doc(db,'applications', aid);

    await updateDoc(dbRef,{
        Status:1, // 1 : Approve (temp)
    });
};

// Reject applicant Endpoint - Sets applicant status in database to 2 (permission denied)
async function rejectApplicant(aid:string):Promise<void>{
    const dbRef = doc(db,'applications', aid);

    await updateDoc(dbRef,{
        Status:2, // 2 : Deny (temp)
    });
};


export { getApplicant, getPendingApplicants, acceptApplicant, rejectApplicant};