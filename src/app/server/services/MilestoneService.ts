import MilestoneData from '@/app/interfaces/Milestones.interface';
import PaymentStatus from '@/app/enums/PaymentStatus.enum';

  // Get all milestones for a specific job
async function getMilestones(jobID: string): Promise<MilestoneData[]> {
  const response = await fetch(`/api/milestones/get/${jobID}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });

  if (response.status == 500) console.error(await response.json());

  return (await response.json()).results;
}
  
// Add a new milestone to a specific job
async function addMilestone(jobID: string, milestoneData: MilestoneData): Promise<string> {
  const response = await fetch(`/api/milestones/add`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({jobID, milestoneData})
  });

  if (response.status == 500) console.error(await response.json());

  return (await response.json()).result;
}
  
// Update a specific milestone's completion (status)
async function updateMilestoneStatus(jobID: string, milestoneID: string, status: number) {
  const response = await fetch(`/api/milestones/status`, {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({jobID, milestoneID, status})
  });

  if (response.status == 500) console.error(await response.json());
}
  
// Set (overwrite) a milestone if needed (optional, not always needed)
async function setMilestone(jobID: string, milestoneID: string, milestoneData: MilestoneData) {
  const response = await fetch(`/api/milestones/set`, {
    method: "PUT",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({jobID, milestoneID, milestoneData})
  });

  if (response.status == 500) console.error(await response.json());
}


//Freelancer can upload work for milestone that client can view
async function addReportURL( jobID:string ,milestoneID: string , reportURL :string){
  const response = await fetch(`/api/milestones/report/add`, {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({jobID, milestoneID, reportURL})
  });

  if (response.status == 500) console.error(await response.json());
}

//Updates the payment status of a milestone according to job and milestone id and the new payment status
async function updateMilestonePaymentStatus(jobID: string, milestoneID: string, status: PaymentStatus) {
  const response = await fetch(`/api/milestones/payment`, {
    method: "PATCH",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({jobID, milestoneID, status})
  });

  if (response.status == 500) console.error(await response.json());
}
  
export { getMilestones, addMilestone, updateMilestoneStatus, setMilestone, updateMilestonePaymentStatus, addReportURL};
