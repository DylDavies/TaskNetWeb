"use client";

import { getMilestones, updateMilestoneStatus } from "@/app/server/services/MilestoneService";
import { useEffect, useState } from "react";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import Button from "../button/Button";
import Modal from "react-modal";

type JobData = {
    jobId: string;
    milestone: { 
        title: string;
        description: string;
        status: string;
        deadline: number;
        payment: number;
    },
  };
  
  type Props = {
      data : JobData,
      onClose: () => void; 
  }

const ViewMilestones: React.FC<Props> = ({data, onClose}) => {
    const JobUID = data.jobId;

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
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Payment</h4>
                        <p className="text-sm text-gray-300">{data.milestone.payment}</p>
                    </section>
                </section>
                    <Button caption="Compelte"/>
                </article>
            </section>
        </>
    );
}

export default ViewMilestones