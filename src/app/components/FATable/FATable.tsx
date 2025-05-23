"use client";
import {
  acceptApplicant,
  getPendingApplicants,
  rejectApplicant,
} from "@/app/server/services/ApplicationDatabaseServices";
import React, { useContext, useEffect, useState } from "react";
import { createNotification } from "@/app/server/services/NotificationService";
import ClientModal from "../ClientModal/clientModal";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
import {
  updateHiredUId,
  updateJobStatus,
} from "@/app/server/services/JobDatabaseService";
import ApplicationData from "@/app/interfaces/ApplicationData.interface";
import JobStatus from "@/app/enums/JobStatus.enum";
import { useRouter } from "next/navigation";
import { JobContext, JobContextType } from "@/app/JobContext";
import { createChat } from "@/app/server/services/MessageDatabaseServices";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { getUser } from "@/app/server/services/DatabaseService";
import UserData from "@/app/interfaces/UserData.interface";
import StarRatingDisplay from "../RatingStars/RatingStars";

interface ApplicantWithRating extends ApplicationData {
  userData?: UserData | null;
}
interface Props {
  jobName: string;
}

const FATable = ({ jobName }: Props) => {
  const router = useRouter();
  const { jobID } = useContext(JobContext) as JobContextType;
  const { user } = useContext(AuthContext) as AuthContextType;
  const [applicantsWithRatings, setApplicantsWithRatings] = useState<ApplicantWithRating[]>([]);
  const [pendingApplicants, setPendingApplicants] = useState<ApplicationData[]>([]);

  //Get all pending applicants for the job to populate the applicants table
  async function fetchPendingApplicants() {
    const pendingApplicants = await getPendingApplicants(jobID as string);
    setPendingApplicants(pendingApplicants);

    // Fetch user data for each applicant
    const applicantsWithUserData = await Promise.all(
      pendingApplicants.map(async (applicant) => {
        const userData = await getUser(applicant.ApplicantID);
        return { ...applicant, userData };
      })
    );
    
    setApplicantsWithRatings(applicantsWithUserData);
  }

  // To update the table after the client accepts or rejects applicants
  useEffect(() => {
    fetchPendingApplicants();
  }, [jobID]);

  const [selectedApplicant, setSelectedApplicant] = useState<ApplicationData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  //Opens the modal displaying the applicants full application to the client
  const handleApplicationView = (ApplicantID: ApplicationData) => {
    setSelectedApplicant(ApplicantID);
    setModalOpen(true);
  };

  //Closes the application modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedApplicant(null);
  };

  //If a client accepts a freelancers application for a job, then that freelancer is accepted and is hired and all the other applicants are rejected
  const handleAccept = async (aid: string, uid: string, jid: string) => {
    try {
      await acceptApplicant(aid); // accept the freelancers applicaion
      await updateHiredUId(jid, uid); //Hire the freelancer
      await updateJobStatus(jid, JobStatus.Employed); //change the status of the job to having someone employed
      await createChat(jid, jobName); // Create a chat for this job

      //Reject all applicants that were not accepted and send them a notification
      for await (const applicant of pendingApplicants) {
        if (applicant.ApplicantID == uid) continue;
        await rejectApplicant(applicant.ApplicationID);

        await createNotification({
          message: `${jobName} - Your application has been rejected`,
          seen: false,
          uidFor: applicant.ApplicantID,
        });
      }

      //Send the freelancer that was accepted for the job a notification
      await createNotification({
        message: `${jobName} - Your application has been accepted`,
        seen: false,
        uidFor: uid,
      });

      // Notify client of chat creation
      await createNotification({
        message: `Chat created for ${jobName}`,
        seen: false,
        uidFor: user!.authUser.uid,
      });

      // Notify freelancer of chat creation
      await createNotification({
        message: `Chat created for ${jobName}`,
        seen: false,
        uidFor: uid,
      });

      router.push("/client");
    } catch (error) {
      console.error(`Error when trying to accept applicant ${error}`);
    }
  };

  //If a client physically rejects the freelancers application by clicking reject on the table, that freelancers application status changes to rejected and the yrecieve a notification that they have been rejected
  const handleReject = async (aid: string, uid: string) => {
    try {
      await rejectApplicant(aid);

      createNotification({
        message: `${jobName} Your application has been rejected`,
        seen: false,
        uidFor: uid,
      });

      await fetchPendingApplicants();
    } catch (error) {
      console.error(`Error when trying to reject applicant ${error}`);
    }
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
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {applicantsWithRatings.map((item, index) => (
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
                        <p className="font-semibold">
                          Bid amount: ${item.BidAmount}
                        </p>
                        <p className="text-xs text-gray-400">
                          Application date:{" "}
                          {formatDateAsString(item.ApplicationDate)}
                        </p>
                      </section>
                    </section>
                  </td>

                  {/* Always show Pending in orange */}
                  <td className="px-4 py-3 text-xs">
                  {item.userData && (
                      <StarRatingDisplay 
                      averageRating={item.userData.ratingAverage || 0}
                      totalRatings={item.userData.ratingCount || 0}
                      />
                    )}
                      {!item.userData && <article>Not rated</article>}
                    
                  </td>
                  <td className="px-4 py-3 text-xs space-x-2">
                  <strong className="px-2 py-1 font-semibold leading-tight rounded-full text-white bg-orange-600">
                      Pending
                    </strong>
                  </td>

                  {/* Accept, Reject and View buttons */}
                  <td className="px-4 py-3 text-xs space-x-2">
                    <button
                      onClick={() => handleApplicationView(item)}
                      className="px-2 py-1 cursor-pointer font-semibold leading-tight rounded-full bg-purple-800 text-purple-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
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
                    {/*Button to accept a freelancers application*/}
                    <button
                      onClick={() =>
                        handleAccept(
                          item.ApplicationID,
                          item.ApplicantID,
                          item.JobID
                        )
                      }
                      className="px-2 py-1 cursor-pointer font-semibold leading-tight rounded-full bg-green-700 text-green-100 transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      Accept
                    </button>
                    {/*Button to reject a freelancers application*/}
                    <button
                      onClick={() =>
                        handleReject(item.ApplicationID, item.ApplicantID)
                      }
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

export default FATable;
