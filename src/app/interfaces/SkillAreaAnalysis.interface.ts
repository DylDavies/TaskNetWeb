interface SkillAreaAnalysis {
    skillArea: string;
    totalProjects: number;
    hiredProjects: number;
    completedProjects: number;
    mostInDemandSkills: { skill: string; count: number }[];
}

export default SkillAreaAnalysis;