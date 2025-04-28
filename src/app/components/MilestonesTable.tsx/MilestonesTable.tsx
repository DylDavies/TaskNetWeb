"use client";
import React, { useContext, useEffect, useState } from "react";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
//import { useRouter } from "next/navigation";
import { JobContext, JobContextType } from "@/app/JobContext";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import { getMilestones } from "@/app/server/services/MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";

interface Props {
  
  onMilestoneClick?: (milestone: MilestoneData) => void;
}

const MilestonesTable = ({ onMilestoneClick}: Props) => {
  //const router = useRouter();

  const { jobID } = useContext(JobContext) as JobContextType;

  const [milestones, setMilestones] = useState<MilestoneData[]>([]);

  useEffect(() => {
    async function fetchMilestones() {
      if (!jobID) return; // Safety check
      try {
        const data = await getMilestones(jobID); 
        setMilestones(data);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    }
  
    fetchMilestones();
  }, [jobID]);

  function MilestoneStatusToString(value: MilestoneStatus| undefined): string {
    if (value === undefined) return 'Unknown';
    return MilestoneStatus[value] || '...';
    }
    
  return (
    <>
      <h4 className="mb-4 text-lg font-semibold text-gray-300">
  Click on a milestone to see more information
</h4>
<section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box">
  <section className="w-full overflow-x-auto">
    <table className="w-full whitespace-no-wrap">
      <thead>
        <tr className="text-xs font-semibold tracking-wide text-left uppercase border-b border-gray-700 bg-gray-800 text-gray-400">
          <th className="px-4 py-3">Milestone</th>
          <th className="px-4 py-3">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700 bg-gray-800">
        {milestones.map((item, index) => (
          <tr 
            key={index} 
            onClick={() => onMilestoneClick?.(item)}
            className="text-gray-400 hover:bg-gray-700 transition duration-150"
          >
            <td className="px-4 py-3">
              <section className="flex items-center text-sm">
                <section className="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                  <section
                    className="absolute inset-0 rounded-full shadow-inner"
                    aria-hidden="true"
                  />
                </section>
                <section>
                  <p className="font-semibold">{item.title}</p>
                  <p className="font-semibold">Payment: R{item.payment}</p>
                  <p className="text-xs text-gray-400">Deadline:  {formatDateAsString(item.deadline)}
                  </p>
                </section>
              </section>
            </td>

            
            {/* Any buttons needed */}
            <td className="px-4 py-3 text-xs space-x-2">
                <strong
                    className={`px-2 py-1 font-semibold leading-tight rounded-full text-white 
                    ${item.status === MilestoneStatus.OnHalt 
                        ? 'bg-red-500' // Yellow if InProgress
                        : item.status === MilestoneStatus.Completed
                        ? 'bg-green-600' // Green if Completed
                        : 'bg-orange-600' // Default: Orange if Pending
                    }`}
                    >
                    {MilestoneStatusToString(item.status)}
                </strong>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
</section>
    </>
  );
};

export default MilestonesTable;