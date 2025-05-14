import Image from "next/image";
import "./FreelancerSkillList.css";
interface FreelancerSkillListProps {
  skills: string[];
  onRemoveSkill?: (skill: string) => void;
}

const FreelancerSkillList: React.FC<FreelancerSkillListProps> = ({
  skills,
  onRemoveSkill,
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
          <section className="container">
            <em>{skill}</em>
            <button
              className="delete-btn"
              onClick={() => onRemoveSkill?.(skill)}
            >
              <Image
                src="/images/deleteIcon.png"
                alt="Delete"
                width={25}
                height={25}
                className="delete-icon"
              />
            </button>
          </section>
        </li>
      ))}
    </ul>
  );
};

export default FreelancerSkillList;
