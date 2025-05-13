interface FreelancerSkillListProps {
  skills: string[];
  area: string | null;
}

const FreelancerSkillList: React.FC<FreelancerSkillListProps> = ({
  skills,
  area,
}) => {
  //if (!area) return <section className="text-gray-500">Select a skill area</section>;

  if (!skills || skills.length === 0)
    return <section className="text-gray-500">No skills found</section>;

  return (
    <ul className="space-y-2">
      {skills.map((skill) => (
        <li
          key={skill}
          className="border p-2 rounded flex justify-between items-center"
        >
          <em>{skill}</em>
        </li>
      ))}
    </ul>
  );
};

export default FreelancerSkillList;
