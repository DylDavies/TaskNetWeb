"use client";
import React, { useContext, useEffect, useRef } from "react";
import formatDateAsNumber, {
  formatDateAsString,
} from "@/app/server/formatters/FormatDates";
import { JobContext, JobContextType } from "@/app/JobContext";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import { getMilestones } from "@/app/server/services/MilestoneService";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import PaymentStatus from "@/app/enums/PaymentStatus.enum";
import "./MilestonesTable.css";
import {
  createNotification,
  getNotificationsForUser,
} from "@/app/server/services/NotificationService";
import { collection, onSnapshot, Unsubscribe } from "firebase/firestore";
import { db } from "@/app/firebase";

type JobData = {
  hiredUId: string;
  title: string;
};

interface Props {
  data: JobData;
  onMilestoneClick?: (milestone: MilestoneData) => void;
  refresh: boolean;
  milestones: MilestoneData[];
  setMilestones: React.Dispatch<React.SetStateAction<MilestoneData[]>>;
}
//This table contains all the milestones that a client has created for a job

const MilestonesTable = ({
  data,
  onMilestoneClick,
  refresh,
  milestones,
  setMilestones,
}: Props) => {
  const { jobID } = useContext(JobContext) as JobContextType;
  const currentDate = formatDateAsNumber(new Date());
  const hiredID = data.hiredUId;
  const jobTitle = data.title;
  const sentRef = useRef(false);

  useEffect(() => {
    let unsub: Unsubscribe;

    //Fetches milestones to populate the milestones table
    async function fetchMilestones() {
      if (!jobID || !hiredID) return;

      try {
        const data = await getMilestones(jobID);
        const sortedData = [...data].sort((a, b) => a.deadline - b.deadline);
        setMilestones(sortedData);
      } catch (error) {
        console.error("Error fetching milestones:", error);
      }

      unsub = onSnapshot(collection(db, "Jobs", jobID, "milestones"), (ss) => {
        const results: MilestoneData[] = [];

        ss.forEach(s => {
          results.push({...(s.data()), id: s.id} as MilestoneData)
        });

        setMilestones(results);
      })
    }

    fetchMilestones();

    return () => {
      if (unsub) unsub();
    }
  }, [jobID, hiredID, refresh]);


  //Sends a notification to the freelancer if a milestones deadline has passed and that freelancer has not yet completed the job
  useEffect(() => {
    async function handleNotifications() {
      if (!milestones.length || sentRef.current) return;

      try {
        const existingNotifications = await getNotificationsForUser(hiredID);

        for (const milestone of milestones) {
          const isDeadlinePassed = milestone.deadline < currentDate;
          const isIncomplete =
            milestone.status !== MilestoneStatus.Completed &&
            milestone.status !== MilestoneStatus.Approved;

          if (isDeadlinePassed && isIncomplete) {
            const notificationExists = existingNotifications.some((notif) => {
              const isMatchingMessage =
                notif.message.includes(
                  `Deadline passed for milestone "${milestone.title}"`
                ) && notif.message.includes(`for job "${jobTitle}"`);
              return isMatchingMessage && notif.deleted === false;
            });

            if (!notificationExists) {
              await createNotification({
                message: `Deadline passed for milestone "${milestone.title}" for job "${jobTitle}"`,
                seen: false,
                uidFor: hiredID,
              });
            }
          }
        }

        sentRef.current = true;
      } catch (error) {
        console.error("Error handling notifications:", error);
      }
    }

    handleNotifications();
  }, [milestones, currentDate, hiredID, jobTitle]);

  //Converts the status of a milestone to a string to be displayed in the table
  function MilestoneStatusToString(value: MilestoneStatus | undefined): string {
    if (value === undefined) return "Unknown";
    return MilestoneStatus[value] || "...";
  }

  //Converts the payment status of a milestone to a string to be displayed in the table
  function PaymentStatusToString(value: PaymentStatus | undefined): string {
    if (value == undefined) return "Unpaid";
    return PaymentStatus[value] || "...";
  }

  return (
    <>
      <h4 className="mb-4 text-lg font-semibold text-gray-300"></h4>
      <section className="w-full mb-8 overflow-hidden rounded-lg shadow-xs box hover-effect">
        <section className="w-full overflow-x-auto">
          <table className="w-full whitespace-no-wrap">
            <thead>
              <tr className="text-xs font-semibold tracking-wide text-left uppercase border-b border-gray-700 bg-gray-800 text-gray-400">
                <th className="px-4 py-3">Milestone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 bg-gray-800">
              {milestones
                .filter((v) => v !== undefined && v !== null)
                .map((item, index) => (
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
                          <p className="font-semibold">
                            Payment: ${item.payment}
                          </p>
                          <p className="text-xs text-gray-400">
                            Deadline: {formatDateAsString(item.deadline)}
                          </p>
                          {/*Displayes in red if a deadline has passed*/}
                          {item.deadline < currentDate &&
                              item.status !== MilestoneStatus.Completed &&
                              item.status !== MilestoneStatus.Approved && (
                                <p className="text-red-500 text-xs font-semibold">
                                  Deadline has passed
                                </p>
                              )}
                        </section>
                      </section>
                    </td>

                    <td className="px-4 py-3 text-xs space-x-2">
                      <strong
                        className={`px-2 py-1 font-semibold leading-tight rounded-full text-white 
                    ${
                      item.status === MilestoneStatus.OnHalt
                        ? "bg-red-500" // Red if on halt
                        : item.status === MilestoneStatus.Completed
                        ? "bg-yellow-600" // Yellow if Completed
                        : item.status === MilestoneStatus.InProgress
                        ? "bg-orange-600" // Orange if in progress
                        : "bg-green-600" //Green if approves
                    }`}
                      >
                        {MilestoneStatusToString(item.status)}
                      </strong>
                    </td>

                    <td className="px-4 py-3 text-xs space-x-2">
                      <strong
                        className={`px-2 py-1 font-semibold leading-tight rounded-full text-white 
                  ${
                    item.paymentStatus == PaymentStatus.Unpaid ||
                    item.paymentStatus == undefined
                      ? "bg-red-500" //Red if not payed
                      : item.paymentStatus == PaymentStatus.Escrow
                      ? "bg-orange-600" //Orange if in escrow
                      : "bg-green-600" //green if paid
                  }`}
                      >
                        {PaymentStatusToString(item.paymentStatus)}
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
