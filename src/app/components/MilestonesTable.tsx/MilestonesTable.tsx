"use client";
import React, { useContext, useEffect } from "react";
import formatDateAsNumber, { formatDateAsString } from "@/app/server/formatters/FormatDates";
import { JobContext, JobContextType } from "@/app/JobContext";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import { getMilestones } from "@/app/server/services/MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import "./MilestonesTable.css";
import { createNotification } from "@/app/server/services/NotificationService";

type JobData = {
  hiredUId:string;
};

interface Props {
  data : JobData,
  onMilestoneClick?: (milestone: MilestoneData) => void;
  refresh: boolean;
  milestones: MilestoneData[];
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneData[]>>;
  
}

const MilestonesTable = ({data, onMilestoneClick, refresh, milestones,setMilestones}: Props) => {

  const { jobID } = useContext(JobContext) as JobContextType;
  const currentDate = formatDateAsNumber(new Date());
  const hiredID = data.hiredUId

  useEffect(() => {
    async function fetchMilestones() {
      if (!jobID) return;
      try {
        const data = await getMilestones(jobID);
        // Sort milestones by deadline (closest first)
        const sortedData = [...data].sort((a, b) => a.deadline - b.deadline);
        setMilestones(sortedData);

        for (const milestone of sortedData) {
        const milestoneDate = milestone.deadline;
        const isDeadlinePassed = milestoneDate < currentDate;
        const isIncomplete = milestone.status !== MilestoneStatus.Completed;

        if (isDeadlinePassed && isIncomplete && hiredID) {
          await createNotification({
            message: `Deadline passed for milestone "${milestone.title}"`,
            seen: false,
            uidFor: hiredID,
          });
        }
      }
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }
    }
  
    fetchMilestones();
  }, [jobID, refresh,setMilestones]);

  function MilestoneStatusToString(value: MilestoneStatus| undefined): string {
    if (value === undefined) return 'Unknown';
    return MilestoneStatus[value] || '...';
  }

    
  return (
    <>
      <h4 className="mb-4 text-lg font-semibold text-gray-300">
  
</h4>
<section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box hover-effect">
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
                  <p className="text-xs text-gray-400">
                    Deadline: {formatDateAsString(item.deadline)}
                    {item.deadline < currentDate && item.status !== MilestoneStatus.Completed && (
                    <section className="text-red-500 font-semibold"> – Deadline has passed</section>
                    )}
                  </p>
                </section>
              </section>
            </td>

            
            <td className="px-4 py-3 text-xs space-x-2">
                <strong
                    className={`px-2 py-1 font-semibold leading-tight rounded-full text-white 
                    ${item.status === MilestoneStatus.OnHalt 
                        ? 'bg-red-500' // Red if on halt
                        : item.status === MilestoneStatus.Completed
                        ? 'bg-yellow-600' // Green if Completed
                        : item.status ===MilestoneStatus.InProgress
                        ? 'bg-orange-600' // Default: Orange if in progress
                        :'bg-green-600'
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