import { uploadFile } from './DatabaseService';
import { getCurrentDateAsNumber } from '../formatters/FormatDates';

//This funciton will upload a CV to the database
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

//This funciton will add an application to the database
async function AddApplication(ApplicantID: string, BidAmount: number, CVURL: string, EstimatedTimeline: number, JobID:string){
    const ApplicantionID = makeApplicationID(JobID, ApplicantID);
    const ApplicationDate = getCurrentDateAsNumber();

    const response = await fetch(`/api/application/add`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ApplicantID, BidAmount, CVURL, EstimatedTimeline, JobID, ApplicantionID, ApplicationDate})
    }); 

    if (response.status == 500) console.error(await response.json());
}

//This function will check if the user has applied for the job
async function hasApplied(AID: string, JobID: string): Promise<boolean> {
    const response = await fetch(`/api/application/applied/${JobID}/${AID}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());

    return (await response.json()).result;
}

//This function will combine the IDs into an application ID
function makeApplicationID(jid: string, uid: string){
    return jid+uid;
}

export {AddApplication, makeApplicationID, uploadCV, hasApplied};