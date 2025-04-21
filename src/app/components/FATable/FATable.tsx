"use client";
import { acceptApplicant, rejectApplicant } from "@/app/server/services/ApplicationDatabaseServices";
import React, { useEffect, useState } from "react";
import ApplicantionStatus from "@/app/enums/ApplicantionStatus.enum";
import { createNotification } from "@/app/server/services/NotificationService";
import ClientModal from "../ClientModal/clientModal";

interface Applicants  {
    
    ApplicationID: string;
    ApplicantID: string;
    ApplicationDate: number;
    BidAmount: number;
    CVURL: string;
    EstimatedTimeline: number;
    JobID: string;
    Status: ApplicantionStatus;
    username: Promise<string>;
}

interface Props {
  data: Applicants[];
  onRowClick?: (applicant: Applicants) => void;
}
const FATable: React.FC<Props> = ({ data,onRowClick }) => {
  //console.log(`The data is: ${JSON.stringify(data, null, 2)}`); //sanity check
  const [pendingApplicants, setPendingApplicants] = useState<Applicants[]>(data);

  useEffect(() => {
    setPendingApplicants(data);
    console.log(
      "new Updated pending applicants with new data:",
      JSON.stringify(data, null, 3)
    );
  }, [data]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicants | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  
    const handleApplicationView = (ApplicantID: Applicants) => {
      
      console.log("selected applicant",ApplicantID);
      setSelectedApplicant(ApplicantID);
      setModalOpen(true);
    };
  
    const closeModal = () => {
      setModalOpen(false);        
      setSelectedApplicant(null); 
    };

  const handleAccept = async (aid: string, uid: string) => {
    try {
      await acceptApplicant(aid);
      setPendingApplicants((currentApplicant) =>
        currentApplicant.filter((applicant) => applicant.ApplicationID != aid)
      ); // for updating table when approved
      //console.log(`Successfully accepted applicant ${aid}`);
    } catch (error) {
      console.error(`Error when trying to accept applicant ${error}`);
    }
    createNotification({
      message: "Your application has been accepted",
      seen: false,
      uidFor: uid
    })

    console.log("user", uid);
  };

  const handleReject = async (aid: string, uid: string ) => {
    try {
      await rejectApplicant(aid);
      setPendingApplicants((currentApplicant) =>
        currentApplicant.filter((applicant) => applicant.ApplicantID != aid)
      ); // for updating table when approved
      //console.log(`Successfully rejected applicant ${aid}`);
    } catch (error) {
      console.error(`Error when trying to reject applicant ${error}`);
    }
    createNotification({
      message: "Your application has been rejected",
      seen: false,
      uidFor: uid
    })
  };

  return (
    <>
      <h4 className="mb-4 text-lg font-semibold text-gray-300">
  Click view to see an applicants application
</h4>
<section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box">
  <section className="w-full overflow-x-auto">
    <table className="w-full whitespace-no-wrap">
      <thead>
        <tr className="text-xs font-semibold tracking-wide text-left uppercase border-b border-gray-700 bg-gray-800 text-gray-400">
          <th className="px-4 py-3">Applicant</th>
          <th className="px-4 py-3">Status</th>
          {/*<th className="px-4 py-3">Date</th>*/}
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700 bg-gray-800">
        {pendingApplicants.map((item, index) => (
          <tr 
            key={index} 
            onClick={() => onRowClick?.(item)} 
            className="text-gray-400 cursor-pointer hover:bg-gray-700 transition duration-150"
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
                  <p className="font-semibold">Bid amount: {item.BidAmount}</p>
                  <p className="text-xs text-gray-400">Application date:  {item.ApplicationDate}
                  </p>
                </section>
              </section>
            </td>

            {/* Always show Pending in orange */}
            <td className="px-4 py-3 text-xs">
              <strong className="px-2 py-1 font-semibold leading-tight rounded-full text-white bg-orange-600">
                Pending
              </strong>
            </td>

            {/* Accept, Reject and View buttons */}
            <td className="px-4 py-3 text-xs space-x-2">
              <button
                onClick={() => handleApplicationView(item)}
                className="px-2 py-1 font-semibold leading-tight rounded-full bg-purple-800 text-purple-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                  View
                </button>
                {/*Modal to display an applicants application*/}
                {modalOpen && selectedApplicant && (
                <ClientModal
                 data={selectedApplicant}
                isOpen={modalOpen}
                onClose={closeModal} 
          /> 
            )}
              <button
                onClick={() => handleAccept(item.ApplicationID, item.ApplicantID)}
                className="px-2 py-1 font-semibold leading-tight rounded-full bg-green-700 text-green-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(item.ApplicationID, item.ApplicantID)}
                className="px-2 py-1 font-semibold leading-tight rounded-full bg-red-700 text-red-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
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

export default FATable;