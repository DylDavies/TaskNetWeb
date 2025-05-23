import React, { useEffect, useState, useRef } from "react";
import JobStatus from "@/app/enums/JobStatus.enum";
import Image from "next/image";
import { getUser } from "@/app/server/services/DatabaseService";
import StarRatingDisplay from "../RatingStars/RatingStars";

interface JobCardProps {
  clientId: string;
  jobTitle: string;
  budget: string;
  deadline: string;
  skills: string[];
  hired?: JobStatus;
  onClick?: () => void;
  isAIRcommended?: boolean;
  aiRecommendationReason?: string;
  redactRating?: boolean;
}

interface TooltipWrapperProps {
  tooltipText: string;
  children: React.ReactNode;
  className?: string;
}

// Simple Tooltip Wrapper Component
const TooltipWrapper: React.FC<TooltipWrapperProps> = ({ tooltipText, children, className }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const tooltipPositionClasses = "bottom-full left-0 mb-2";

  return (
    <section
      ref={wrapperRef}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      className={`relative inline-block ${className || ''}`}
    >
      {children}
      {isVisible && tooltipText && (
        <section
          ref={tooltipRef}
          role="tooltip"
          className={`absolute ${tooltipPositionClasses} z-20 w-max max-w-xs p-2 text-xs font-normal text-white rounded-md shadow-lg transition-opacity duration-300 bg-gray-700`}
        >
          {tooltipText}
          <section className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></section>
        </section>
      )}
    </section>
  );
};


const JobCard: React.FC<JobCardProps> = ({
  jobTitle,
  budget,
  deadline,
  skills,
  hired,
  onClick,
  clientId,
  isAIRcommended,
  aiRecommendationReason,
  redactRating = false
}) => {
  const[aveRating, setRating] = useState<number |null>();
  const[totalRating,setTotalRatings]= useState<number | null>();
  const [name, setName] = useState("Loading...");
  const [avatar, setAvatar] = useState<string | undefined>();

  //Gets user information to display the rating
  useEffect(() => {
    (async () => {
      try {
        const user = await getUser(clientId);
        setName(user?.username || "User Not Found");
        setRating(user?.ratingAverage);
        setTotalRatings(user?.ratingCount);
        setAvatar(user?.avatar || undefined);
      } catch (error)
      {
        console.error("Failed to fetch user:", error);
        setName("Error Loading User");
        setAvatar(undefined);
      }
    })();
  }, [clientId]);

  //Star icon to display on the AI recommended jobs
  const StarIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 mr-1 text-yellow-500"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );

  return (
    <article
      onClick={onClick}
      aria-label={`${jobTitle} by ${name}${isAIRcommended ? `, AI Recommended. Reason: ${aiRecommendationReason || 'General recommendation'}` : ''}`}
      className={`job-card bg-gray-800 group grid w-[450px] grid-cols-12 space-x-1 overflow-hidden rounded-lg border cursor-pointer hover:-translate-y-1 hover:border-opacity-100  ${
        isAIRcommended ? 'border-yellow-500 shadow-lg shadow-yellow-500/30' : 'border-blue-900'
      } py-4 px-4 text-gray-300 shadow transition hover:shadow-lg relative `}
    >
      <section className="col-span-12 flex justify-between items-start mb-2">
        <section className="flex items-center space-x-3">
          {avatar ? (
            <Image
              src={avatar}
              alt={`${name}'s Avatar`}
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
              onError={() => setAvatar(undefined)}
            />
          ) : (
            <section className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
              {name && name.length > 0 ? name.charAt(0).toUpperCase() : "?"}
            </section>
          )}
          <h2 className="text-xl font-bold text-gray-200">{jobTitle}</h2>
        </section>

        <section className="flex items-center space-x-2 mt-1 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <time dateTime={deadline} className="text-sm text-gray-400">{deadline}</time>
        </section>
      </section>

      <hr className="col-span-12 border-t border-gray-700 mb-3" />

      <section className="col-span-12 space-y-4">
        <section className="text-sm font-medium text-gray-300">
          <strong className="font-semibold text-gray-200">Budget:</strong>
          <data value={budget} className="ml-1 rounded-full bg-blue-800 px-2 py-0.5 text-blue-100">
            {budget}
          </data>
        </section>

        <section className="flex flex-wrap gap-2 text-sm font-medium text-gray-300">
          <strong className="font-semibold mr-2 text-gray-200">Skills:</strong>
          {skills.map((skill, index) => (
            <data
              key={index}
              value={skill}
              className="rounded-full bg-gray-700 px-3 py-0.5 text-sm text-gray-200 hover:bg-gray-600 transition-colors"
            >
              {skill}
            </data>
          ))}
        </section>

        <footer className="flex justify-between space-between items-center text-sm text-gray-400 pt-2 border-t border-gray-700 mt-3">

          <section className="flex items-center space-x-3">
            {isAIRcommended && aiRecommendationReason && ( 
              <TooltipWrapper tooltipText={aiRecommendationReason} className="cursor-help">
                <section className="flex items-center text-xs text-yellow-400 font-semibold">
                  <StarIcon />
                  AI Pick
                </section>
              </TooltipWrapper>
            )}
            {isAIRcommended && !aiRecommendationReason && (
                 <section className="flex items-center text-xs text-yellow-400 font-semibold">
                    <StarIcon />
                    AI Pick
                 </section>
            )}
            <address className="not-italic font-medium text-gray-300">{name}</address>

            {/*Only showing the rating on the job card on the job search page, client cant see their rating on their job card*/}
            {!redactRating && (aveRating !== undefined && totalRating !== undefined && aveRating && totalRating) && (
                  <StarRatingDisplay averageRating={aveRating} totalRatings={totalRating} />
            )}
          </section>

          {/*The colour and test of the status of the job changes depending on the jobs status*/}
          {hired === JobStatus.Posted && (
            <output className="font-medium text-orange-400">Open to applicants</output>
          )}
          {hired === JobStatus.Employed && (
            <output className="font-medium text-yellow-400">Hired</output>
          )}

          {hired === JobStatus.InProgress && (
            <output className="font-medium text-yellow-400">In Progress</output>
          )}

          {hired === JobStatus.Completed && (
            <output className="font-medium text-green-400">Completed</output>
          )}
        </footer>
      </section>
    </article>
  );
};
export default JobCard;
