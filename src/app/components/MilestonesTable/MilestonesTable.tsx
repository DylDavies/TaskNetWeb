"use client";
import React, { useContext, useEffect, useState } from "react";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
import ApplicationData from "@/app/interfaces/ApplicationData.interface";
import { useRouter } from "next/navigation";
import { JobContext, JobContextType } from "@/app/JobContext";

interface Props {
  jobName: string
}

const MilestonesTable = ({jobName}: Props) => {
  const router = useRouter();

  const { jobID } = useContext(JobContext) as JobContextType;

  const [pendingApplicants, setPendingApplicants] = useState<ApplicationData[]>([]);

  /*async function fetchPendingApplicants() {
    const pendingApplicants = await getPendingApplicants(jobID as string);
    setPendingApplicants(pendingApplicants);
  }

  // To update the table after the client accepts or rejects applicants
  useEffect(() => {
    fetchPendingApplicants();
  }, [jobID]);*/

    
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
          {/*<th className="px-4 py-3">Date</th>*/}
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700 bg-gray-800">
        {pendingApplicants.map((item, index) => (
          <tr 
            key={index} 
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
                  <p className="font-semibold">{item.username}</p>
                  <p className="font-semibold">Bid amount: R{item.BidAmount}</p>
                  <p className="text-xs text-gray-400">Application date:  {formatDateAsString(item.ApplicationDate)}
                  </p>
                </section>
              </section>
            </td>

            {/* Always show Pending in orange */}
            <td className="px-4 py-3 text-xs">
              <strong className="px-2 py-1 font-semibold leading-tight rounded-full text-white bg-orange-600">
                put functionality for status
              </strong>
            </td>

            {/* Any buttons needed */}
            <td className="px-4 py-3 text-xs space-x-2">
              <button
                
                className="px-2 py-1 cursor-pointer font-semibold leading-tight rounded-full bg-green-700 text-green-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                Accept
              </button>
              <button
                
                className="px-2 py-1 cursor-pointer font-semibold leading-tight rounded-full bg-red-700 text-red-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                Reject
              </button>
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