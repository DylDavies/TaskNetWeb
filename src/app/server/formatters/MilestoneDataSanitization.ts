import MilestoneData from "@/app/interfaces/Milestones.interface";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";

// sanitize the data that clients send for a job that they want to create
const sanitizeMilestoneData = (MilestoneData: Partial<MilestoneData>): MilestoneData => {

  const errors: string[] = [];


  // Error checking an sanitization:
  if (!MilestoneData.title || typeof MilestoneData.title !== "string") errors.push("title is missing or not a string");
  if (!MilestoneData.description || typeof MilestoneData.description !== "string") errors.push("description is missing or not a string");
 
  const status = MilestoneStatus.OnHalt;

  if (typeof MilestoneData.payment !== "number" || MilestoneData.payment < 0) errors.push("payment must be a non-negative number.");
  

  /*Maybe add a checks for date:
      
      The format is YYYYMMDD as a number
      YYYY for both deadline and created at must be >= 2025
      MM for both deadline and created at must be 1<= MM<= 12
      for certain months it must be within that months amount of days:

  */

  if (typeof MilestoneData.deadline !== "number" || MilestoneData.deadline.toString().length !== 8) errors.push("Invalid deadline date format.");
  if (typeof MilestoneData.deadline !== "number" || MilestoneData.deadline.toString().length !== 8) errors.push("Invalid deadline date format.");


  if (errors.length > 0) {
    const errorMessage = "Validation failed:\n" + errors.join("\n");
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  else {
    console.log("Data is safe to send to the DB!");
  }


  return {
    title: MilestoneData.title!,
    description: MilestoneData.description!,
    deadline: MilestoneData.deadline!,
    status: status,
    payment: MilestoneData.payment!,
    reportURL: MilestoneData.reportURL!
    
  };
}

export { sanitizeMilestoneData };