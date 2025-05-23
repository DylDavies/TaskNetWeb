import SkillData from "@/app/interfaces/SkillData.interface";
import { getJob } from "./JobDatabaseService";


//return skills in a skill area
async function getSkillByArea(SkillArea: string): Promise<string[]>{
 const response = await fetch(`/api/jobs/${SkillArea}`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) console.error("Failed to get Skill area");
  return (await response.json()).result;

}

//This funciton will add a skill to the skill database
async function AddSkill(SkillArea: string, skillName: string) {
  try {
    const response = await fetch(`/api/skills/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ SkillArea, skillName })
    });

    if (!response.ok) {
      throw new Error('Failed to add skill');
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding skill:", error);
    throw error;
  }
}

//This function will return an array of maps each containing the skill area id and an array of skills that fall into that category
async function getSkillArray(): Promise<SkillData[]>{

  try{
  const response = await fetch(`/api/skills/all`, {
    method: "GET",
    headers: { 'Content-Type': 'application/json'},
  });

  if(!response.ok) console.error("Failed to fetch all the jobs");
    
  return (await response.json()).results;
  }
  catch(error){
    console.error("Error getting all the skills", error);
    return [];
  }

}

//This function will return the skills for the given JobID
async function getSkillsForJob(jid: string): Promise<SkillData[] | null> { 
    const jobData = await getJob(jid);
    if (jobData) {
        const skillDataArray: SkillData[] = [];
        for (const skillArea in jobData.skills) {
            if (jobData.skills.hasOwnProperty(skillArea)) { 
                skillDataArray.push({
                    id: skillArea,
                    skills: jobData.skills[skillArea],
                });
            }
        }
        return skillDataArray;
    } else {
        return null; 
    }
}

// Helper to get all skills 
async function getAllSkills(): Promise<string[]> {
  const skillArray = await getSkillArray();
  const skills = skillArray.flatMap((area) => area.skills)
  const uniqueSkills = Array.from(new Set(skills));
  return uniqueSkills;
}

// Endpoint to get all Ids
async function getAllSkillIDs(): Promise<string[]> {
  try {
    const response = await fetch(`/api/skills/ids`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json'},
    });

    if(!response.ok) console.error("Failed to get skill ids");
    return (await response.json()).results;
  } catch (error) {
    console.error("Error fetching job IDs:", error);
    return [];
  }
}

// Endpoint to get skill area mapping from given skill names
async function mapSkillsToAreas(skillNames: string[]): Promise<{ [skillArea: string]: string[] }> {
  try{
    const response = await fetch(`/api/skills/map`, {
      method: "POST",
      headers:  { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skillNames })
    });

    if(!response.ok) console.error("Failed to map skills to areas");

    return (await response.json()).results;
  }
  catch(error){
    console.error("Error mapping skills to ares", error);
    return {};
  }
}

export {AddSkill, getSkillArray, getAllSkillIDs, getAllSkills, mapSkillsToAreas, getSkillsForJob, getSkillByArea};