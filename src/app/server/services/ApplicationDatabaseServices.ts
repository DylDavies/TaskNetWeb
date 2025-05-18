import ApplicantData from "../../interfaces/ApplicationData.interface";

async function getApplicant(ApplicantID: string): Promise<ApplicantData | null> {
    const response = await fetch(`/api/application/get/${ApplicantID}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    }); 

    return (await response.json()).result;
};

// Fetch pending applicants Endpoint:
async function getPendingApplicants(JobID: string): Promise<ApplicantData[]>{
    const response = await fetch(`/api/application/get/pending/${JobID}`, {
        method: "GET",
        headers: { 'Content-Type': 'application/json' }
    });

    return (await response.json()).results;
};  

// Accept applicant Endpoint - Sets applicant status in database to 1 (permission granted)
async function acceptApplicant(aid: string):Promise<void>{
    const response = await fetch(`/api/application/accept/${aid}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
};

// Reject applicant Endpoint - Sets applicant status in database to 2 (permission denied)
async function rejectApplicant(aid:string):Promise<void>{
    const response = await fetch(`/api/application/deny/${aid}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
};


export { getApplicant, getPendingApplicants, acceptApplicant, rejectApplicant};