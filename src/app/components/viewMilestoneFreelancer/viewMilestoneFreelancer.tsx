"use client";

//import { updateMilestoneStatus } from "@/app/server/services/MilestoneService";
import { useState } from "react";
import Button from "../button/Button";
//import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";

type JobData = {
    jobId: string;
    clientUID: string;
    HiredUID: string;
    milestone: { 
        title: string;
        description: string;
        status: string;
        deadline: number;
        payment: number;
        reportURL?: string;
    },
  };
  
  type Props = {
      data : JobData,
      onClose: () => void; 
      onUpload: () => void;
  }

const ViewMilestones: React.FC<Props> = ({data, onClose, onUpload}) => {
    const [status, setStatus] = useState(data.milestone.status);
    const [role, setRole] = useState("client");

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedStatus = e.target.value;
        const confirmed = window.confirm(
            `Are you sure you want to change status to ${selectedStatus}`
          );
          if (!confirmed) {
            return;
          }
          setStatus(selectedStatus);
    }
    return(
        <>
            <section className="fixed inset-0 flex items-center justify-center z-50">
                <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
                <section className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Milestone Details</h2>
                    <button
                        onClick={onClose}
                        className="text-white text-xl hover:text-red-400">
                        ×
                    </button>
                </section>
                <section className="flex flex-col gap-4">
                    <h3 className="text-2xl font-semibold">{data.milestone.title}</h3>
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Description</h4>
                        <p className="text-sm text-gray-300">{data.milestone.description}</p>
                    </section>
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Deadline</h4>
                        <p className="text-sm text-gray-300">{data.milestone.deadline}</p>
                    </section>
                    {}
                    {/*<section>
                        <h4 className="font-semibold text-sm mb-1">Payment</h4>
                        <p className="text-sm text-gray-300">{data.milestone.payment}</p>
                    </section>*/}
                {data.milestone.reportURL ? (
                    <text>{data.milestone.reportURL}</text>
                ): null}
                {role === "freelancer" && status !== "Completed" && (
                    <section>
                        <fieldset>
                            <legend>Select Status</legend>
                            <section>
                                <input type ="radio" id="pending" name="status" value="pending" onChange={handleStatusChange} checked={status === "pending"}/>
                                <label htmlFor="pending"> Pending</label>
                            </section>
                            <section>
                                <input type ="radio" id="In Progress" name="status" value="In Progress" onChange={handleStatusChange} checked={status === "In Progress"}/>
                                <label htmlFor="In Progress"> In Progress</label>
                            </section>
                            <section>
                                <input type ="radio" id="Completed" name="status" value="Completed" onChange={handleStatusChange} checked={status === "Completed"}/>
                                <label htmlFor="Completed"> Completed</label>
                            </section>
                        </fieldset>
                    </section>)
                }
                {role === "freelancer" && status === "Completed" && !data.milestone.reportURL && (
                    <Button caption="Upload Report" onClick={onUpload}/>
                )}
                {role === "client" && status === "Completed" && (
                    <Button caption="Approve"/>
                )}
                </section>
                </article>
            </section>
        </>
    );
}

export default ViewMilestones