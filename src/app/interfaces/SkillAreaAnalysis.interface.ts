interface SkillAreaAnalysis {
    skillArea: string;
    totalProjects: number;
    hiredProjects: number;
    completedProjects: number;
    mostInDemandSkills: { skill: string; count: number }[];
    skillCounts?: Record<string, number>;
}

export default SkillAreaAnalysis;