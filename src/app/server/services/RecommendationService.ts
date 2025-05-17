import { AI } from "@/app/firebase"; // Assuming AI is correctly configured
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import ActiveUser from "@/app/interfaces/ActiveUser.interface";
import JobStatus from "@/app/enums/JobStatus.enum"; // Assuming you have this for JobStatus.Employed etc.

// Define an interface for the expected structure of each item in the AI's JSON response
export interface AIJobRecommendation {
  jobId: string;
  reason: string;
}

async function recommendJobs(
  user: ActiveUser,
  potentialJobs: ActiveJob[]
): Promise<AIJobRecommendation[]> {
  const relevantJobs = potentialJobs.filter(job => {
    return job.jobData.status !== JobStatus.Employed && job.jobData.status !== JobStatus.Completed;
  });

  if (relevantJobs.length === 0) {
    return [];
  }

  let jobDetailsForPrompt = relevantJobs.map(p => ({
    jobId: p.jobId,
    title: p.jobData.title,
    descriptionSnippet: p.jobData.description.substring(0, 200) + (p.jobData.description.length > 200 ? "..." : ""),
    skillsRequired: Object.values(p.jobData.skills).flat(),
    budget: `Min: ${p.jobData.budgetMin}, Max: ${p.jobData.budgetMax}`,
  }));

  const MAX_JOBS_IN_PROMPT = 20;
  if (jobDetailsForPrompt.length > MAX_JOBS_IN_PROMPT) {
    jobDetailsForPrompt = jobDetailsForPrompt.slice(0, MAX_JOBS_IN_PROMPT);
  }
  
  const userDetailsForPrompt = {
    userId: user.authUser.uid,
    username: user.userData.username,
    ratingAverage: user.userData.ratingAverage,
    skills: Object.values(user.userData.skills ?? {}).flat()
  };

  let prompt = `
    You are an expert job recommendation assistant.
    Based on the provided user profile and a list of available jobs, please select up to 5 jobs that would be a good fit for the user.
    Do not include any jobs the user has already been hired for, or jobs that are already 'Employed' or 'Completed'.

    User Profile:
    ${JSON.stringify(userDetailsForPrompt, null, 2)}

    Available Jobs (note: 'skillsRequired' lists all skills needed for the job):
    ${JSON.stringify(jobDetailsForPrompt, null, 2)}

    Please return your recommendations STRICTLY as a valid JSON array of objects. Each object must contain exactly two keys: "jobId" (string, from the 'jobId' field of the available jobs) and "reason" (string, a very brief explanation for the recommendation, approximately 10 words or less, explaining how it matches the user profile and job requirements, keeping in mind that the user will see this - so be tactful and phrase it in a way that encourages them to apply, being positive and excited. E.g. 'Matches your skills!').
    Do not include any other text, explanations, or markdown formatting like \`\`\`json or \`\`\` outside of the JSON array itself.

    Example of the exact expected output format:
    [
      {"jobId": "some-job-id-123", "reason": "Matches user's profile and the job requires skills X, Y."},
      {"jobId": "another-job-id-456", "reason": "Good fit for the user because of Z."}
    ]
  `;

  try {
    const { response } = await AI.generateContent(prompt);
    let responseText = response.text()

    const jsonMatch = responseText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);

    if (!jsonMatch || !jsonMatch[0]) {
      console.error("AI response did not contain a recognizable JSON structure.", responseText);
      return [];
    }

    let potentialJson = jsonMatch[0];
    potentialJson = potentialJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');

    const recommendations: AIJobRecommendation[] = JSON.parse(potentialJson);

    if (!Array.isArray(recommendations) || 
        !recommendations.every(item => 
            item &&
            typeof item.jobId === 'string' && 
            typeof item.reason === 'string' &&
            jobDetailsForPrompt.some(job => job.jobId === item.jobId) 
        )
       ) {
        console.error("Parsed JSON does not match the expected structure or contains invalid job IDs:", recommendations);
        const validRecommendations = recommendations.filter(item => 
            item && 
            typeof item.jobId === 'string' && 
            typeof item.reason === 'string' &&
            jobDetailsForPrompt.some(job => job.jobId === item.jobId)
        );
        return validRecommendations.slice(0, 5);
    }
    
    return recommendations.slice(0, 5);

  } catch (error) {
    console.error("Error in recommendJobs function:", error);
    if (error instanceof SyntaxError) {
        console.error("JSON Parsing Error. Raw text was:", (error as any).sourceText);
    }
    return [];
  }
}

export { recommendJobs };
