import JobData from "@/app/interfaces/JobData.interface";
import JobStatus from "@/app/enums/JobStatus.enum";

// sanitize the data that clients send for a job that they want to create
const sanitizeJobData = (jobData: Partial<JobData>): JobData => {

  const errors: string[] = [];
  /*
  Add checks that sees if the ClientUId are in the users collection
  if not return some error like "Client does not exist"

  Allow hiredUId to be empty because that will be updated later when a freelancer takes the job
  */


  // Error checking an sanitization:
  if (!jobData.title || typeof jobData.title !== "string") errors.push("title is missing or not a string");
  if (!jobData.description || typeof jobData.description !== "string") errors.push("description is missing or not a string");

  // we handle hiredUId, this is for clients so it can be empty
  const hiredUId = "";
  const status = JobStatus.Posted;

  if (!jobData.clientUId || typeof jobData.clientUId !== "string") errors.push("clientUId is missing or not a string");
  if (typeof jobData.budgetMin !== "number" || jobData.budgetMin < 0) errors.push("minimum budget must be a non-negative number.");
  if (typeof jobData.budgetMax !== "number" || jobData.budgetMax < 0) errors.push("maximum budget must be a non-negative number.");
  if (jobData.budgetMin !== undefined && jobData.budgetMax !== undefined && jobData.budgetMax < jobData.budgetMin)errors.push("Maximum budget must be greater than minimum budget");

  /*Maybe add a checks for date:
      
      The format is YYYYMMDD as a number
      YYYY for both deadline and created at must be >= 2025
      MM for both deadline and created at must be 1<= MM<= 12
      for certain months it must be within that months amount of days:

  */

  if (typeof jobData.deadline !== "number" || jobData.deadline.toString().length !== 8) errors.push("Invalid deadline date format.");
  if (typeof jobData.deadline !== "number" || jobData.deadline.toString().length !== 8) errors.push("Invalid deadline date format.");
  if (typeof jobData.createdAt !== "number" || jobData.createdAt.toString().length !== 8) errors.push("Invalid createdAt date format.");

  //------ Add checks to ensure that the Skill Areas exists possibly the same with skills ------
  if (!jobData.skills || typeof jobData.skills !== "object") {
    errors.push("Skills must be provided as an object");
  } else {
    for (const [skillArea, skills] of Object.entries(jobData.skills)) {
      if (!Array.isArray(skills)) {
        errors.push(`Skills for ${skillArea} must be an array`);
        continue;
      }

      for (const skill of skills) {
        if (typeof skill !== "string") {
          errors.push(`Skill in ${skillArea} must be a string`);
        }
      }
    }
  }

  if (errors.length > 0) {
    const errorMessage = "Validation failed:\n" + errors.join("\n");
    console.error(errorMessage);
    throw new Error(errorMessage);
  }


  return {
    title: jobData.title!,
    description: jobData.description!,
    hiredUId: hiredUId,
    clientUId: jobData.clientUId!,
    deadline: jobData.deadline!,
    createdAt: jobData.createdAt!,
    skills: jobData.skills!,
    status: status,
    budgetMin: jobData.budgetMin!,
    budgetMax: jobData.budgetMax!,
  };
}

export { sanitizeJobData };