import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/app/firebase';
import ApplicationStatus from '@/app/enums/ApplicationStatus.enum';
import { uploadFile } from './DatabaseService';

function getCurrentDateAsNumber() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
  
    return Number(`${year}${month}${day}`);
  }

  async function uploadCV(file: File, ApplicationID: string){
    if(file.type !== "application/pdf"){
        alert("Please submit a pdf only");
        return " "; 
    }
    const name = ApplicationID+"CV";
    const path ="CV"
    const CVurl = uploadFile(file, path, name);

    return CVurl;

}

async function AddApplication(ApplicantID: string, BidAmount: number, CVURL: string, EstimatedTimeline: number, JobID:string){
    const ApplicantionID = makeApplicationID(JobID, ApplicantID);
    const ApplicationDate = getCurrentDateAsNumber();
    await setDoc(doc(db, "applications", ApplicantionID), {
        ApplicantID: ApplicantID,
        ApplicationDate: ApplicationDate,
        BidAmount: BidAmount,
        CVURL: CVURL,
        EstimatedTimeline: EstimatedTimeline,
        JobID: JobID,
        Status: ApplicationStatus.Pending
      });  
}

function makeApplicationID(jid: string, uid: string){
    return jid+uid;
}

export {AddApplication, makeApplicationID, uploadCV};