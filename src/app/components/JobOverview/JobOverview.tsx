import React, { useEffect, useState } from "react";
import "./JobOverview.css";
import JobStatus from "@/app/enums/JobStatus.enum";
import Image from "next/image";
import { getUser } from "@/app/server/services/DatabaseService";
import StarRatingDisplay from "../RatingStars/RatingStars";

/*
--- NOTE ON USE ---

import JobOverview from "../components/JobOverview/JobOverview";

example:

<Button 

  const jobData = {
    company: "Company name",
    jobTitle: "Title of job",
    budget: "180k - 250k",
    deadline: "30 April 2025",
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Git"],
  };

  where you want to place the card, call this: <JobOverview onClick{clickFunction} {...jobData}  />


  You must pass the card :
  - company: string;
  -jobTitle: string;
  -budget: string;
  -deadline: string;
  -skills: string[];
/>
*/

interface JobCardProps {
  clientId: string;
  jobTitle: string;
  budget: string;
  deadline: string;
  skills: string[];
  hired?: JobStatus;
  onClick?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({
  jobTitle,
  budget,
  deadline,
  skills,
  hired,
  onClick,
  clientId,
}) => {
  const [ name, setName ] = useState("Loading...");
  const[aveRating, setRating] = useState<number |null>();
  const[totalRating,setTotalRatings]= useState<number | null>();
  const [ avatar, setAvatar ] = useState<string | null>();

  useEffect(() => {
    (async () => {
      const user = await getUser(clientId);

      //Getting everything needed to show the clients rating on the job card
      setName(user?.username || "Not found"); 
      setRating(user?.ratingAverage);
      setTotalRatings(user?.ratingCount);
      setAvatar(user?.avatar);
    })();
  }, []);

  return (
    <article
      onClick={onClick}
      aria-label={`${jobTitle} at ${name}`}
    >
      <section className="job-card bg-gray-800 group grid w-[450px] grid-cols-12 space-x-1 overflow-hidden rounded-lg border border-blue-900 py-4 px-4 text-gray-700 shadow transition hover:shadow-lg">
        {/* Header Row */}
        <section className="col-span-12 flex justify-between items-center mb-2">
          {/* Icon and Job Title */}
          <section className="flex items-center space-x-3">
      {/* Client avatar */}
      { avatar ?
      (
        <Image src={avatar} alt="Avatar" className="w-10 h-10 rounded-full" width={200} height={200}></Image>
      )
      : (
        <section className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
          {name.charAt(0).toUpperCase()}
        </section>
      )}
            <h2 className="text-xl font-bold text-gray-300">{jobTitle}</h2>
          </section>

          {/* Deadline with Clock Icon */}
          <section className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <time className="text-sm text-gray-300">{deadline}</time>
          </section>
        </section>

        {/* Divider line under header */}
        <hr className="col-span-12 border-t border-gray-700 mb-3" />

        {/* Main Content */}
        <section className="col-span-12 space-y-4">
          {/* Budget */}
          <section className="text-sm font-medium text-gray-300">
            <strong className="font-semibold">Budget:</strong>
            <data className="ml-1 rounded-full bg-blue-900 px-2 py-0.5 text-blue-200">
              {budget}
            </data>
          </section>

          {/* Skills */}
          <section className="flex flex-wrap gap-2 text-sm font-medium text-gray-300">
            <strong className="font-semibold mr-2">Skills:</strong>
            {skills.map((skill, index) => (
              <data
                key={index}
                className="rounded-full bg-gray-700 px-3 py-0.5 text-sm text-gray-200"
              >
                {skill}
              </data>
            ))}
          </section>

          {/* Company, Deadline and rating stars inline at the bottom */}
          <footer className="flex justify-between items-center text-sm text-gray-400 pt-1 border-t border-gray-700 mt-2">
            <address className="italic">{name}</address>
          {(aveRating !== undefined && totalRating !== undefined && aveRating && totalRating) && (
                  <StarRatingDisplay averageRating={aveRating} totalRatings={totalRating} />
              )}
          {hired === JobStatus.Posted && (
            <output className="italic text-orange-400">Open to applicants</output>
          )}

          {hired === JobStatus.Employed && (
            <output className="italic text-yellow-400">Hired</output>
          )}

          {hired === JobStatus.InProgress && (
            <output className="italic text-yellow-400">In Progress</output>
          )}

          {hired === JobStatus.Completed && (
            <output className="italic text-green-400">Completed</output>
          )}
          </footer>
        </section>
      </section>
    </article>
  );
};
export default JobCard;
