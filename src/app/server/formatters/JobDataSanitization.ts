import JobData from "@/app/interfaces/JobData.interface";
import JobStatus from "@/app/enums/JobStatus.enum";

// sanitize the data that clients send for a job that they want to create
const sanitizeJobData = (title: string, description: string, clientUId: string,
  deadline: number, createdAt: number, skills: { [skillArea: string]: number[] },
  budgetMin: number, budgetMax: number): JobData => {

  const errors: string[] = [];
  /*
  Add checks that sees if the ClientUId are in the users collection
  if not return some error like "Client does not exist"

  Allow hiredUId to be empty because that will be updated later when a freelancer takes the job
  */


  // Error checking an sanitization:
  if (!title || typeof title !== "string") errors.push("title is missing or not a string");
  if (!description || typeof description !== "string") errors.push("description is missing or not a string");

  // we handle hiredUId, this is for clients so it can be empty
  const hiredUId = "";
  const status = JobStatus.Posted;

  if (!clientUId || typeof clientUId !== "string") errors.push("clientUId is missing or not a string");
  if (typeof budgetMin !== "number" || budgetMin < 0) errors.push("minimum budget must be a non-negative number.");
  if (typeof budgetMax !== "number" || budgetMax < 0) errors.push("maximum budget must be a non-negative number.");
  if (typeof budgetMax !== "number" || budgetMax < budgetMin) errors.push("maximum budget must be greater than budgetMin.");

  /*Maybe add a checks for date:
      
      The format is YYYYMMDD as a number
      YYYY for both deadline and created at must be >= 2025
      MM for both deadline and created at must be 1<= MM<= 12
      for certain months it must be within that months amount of days:

  */

  if (typeof deadline !== "number" || deadline.toString().length !== 8) errors.push("Invalid deadline date format.");
  if (typeof createdAt !== "number" || createdAt.toString().length !== 8) errors.push("Invalid createdAt date format.");



  // Checking skills:
  if (skills && typeof skills === "object") {
    Object.keys(skills).forEach((skillArea) => {
      const skillIndices = skills[skillArea];
      if (!Array.isArray(skillIndices) || !skillIndices.every((i) => Number.isInteger(i))) {
        errors.push(`Invalid skill indices for ${skillArea}.`);
      }
    });
  } else {
    errors.push("Skills map is invalid.");
  }



  if (errors.length > 0) {
    alert("Failed to create Job due to: \n"+errors.join("\n"))
    throw new Error("Sanitization failed: \n" + errors.join("\n")); // Maybe throw new error or alert

  }
  else {
    console.log("Data is safe to send to the DB!");
  }


  return {
    title,
    description,
    hiredUId,
    clientUId,
    deadline,
    createdAt,
    skills,
    status,
    budgetMin,
    budgetMax,
  };
}

export { sanitizeJobData };