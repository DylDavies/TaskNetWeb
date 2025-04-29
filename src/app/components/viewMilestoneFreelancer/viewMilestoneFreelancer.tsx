"use client";

//import { updateMilestoneStatus } from "@/app/server/services/MilestoneService";
import { useState, useContext, useEffect } from "react";
import Button from "../button/Button";
import { AuthContext, AuthContextType } from "../../AuthContext";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import Modal from "react-modal";

type JobData = {
    jobId: string;
    clientUID: string;
    milestone: { 
        title: string;
        description: string;
        status: MilestoneStatus;
        deadline: number;
        payment: number;
        reportURL?: string;
    },
  };
  
  type Props = {
      data : JobData,
      onClose: () => void; 
      onUpload: () => void;
      modalIsOpen : boolean;
  }

const ViewMilestones: React.FC<Props> = ({data, onClose, onUpload, modalIsOpen}) => {
    const { user } = useContext(AuthContext) as AuthContextType;
    const [status, setStatus] = useState<MilestoneStatus>(data.milestone.status);
    const [role, setRole] = useState("client");

    useEffect(() =>{
        if(user?.authUser?.uid == data.clientUID){
            setRole("client");
        }
        else{
            setRole("freelancer");
        }
    }, [user, data.clientUID]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedStatus = e.target.value;
        const confirmed = window.confirm(
            `Are you sure you want to change status to ${e.target.id}`
          );
          if (!confirmed) {
            return;
          }
          const enumValue = MilestoneStatus[selectedStatus as keyof typeof MilestoneStatus];
          if(enumValue === undefined) return;
          setStatus(enumValue);
    }
    return(
        <Modal
        isOpen = {modalIsOpen}
        onRequestClose={onClose}
        className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-60"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
        ariaHideApp={false}>
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
                {role === "freelancer" && status !== MilestoneStatus.Completed && (
                    <section>
                        <fieldset>
                            <legend>Select Status</legend>
                            <section>
                                <input type ="radio" id="pending" name="status" value={MilestoneStatus.OnHalt} onChange={handleStatusChange} checked={status === MilestoneStatus.OnHalt}/>
                                <label htmlFor="pending"> Pending</label>
                            </section>
                            <section>
                                <input type ="radio" id="In Progress" name="status" value={MilestoneStatus.InProgress} onChange={handleStatusChange} checked={status === MilestoneStatus.InProgress}/>
                                <label htmlFor="In Progress"> In Progress</label>
                            </section>
                            <section>
                                <input type ="radio" id="Completed" name="status" value={MilestoneStatus.Completed} onChange={handleStatusChange}/>
                                <label htmlFor="Completed"> Completed</label>
                            </section>
                        </fieldset>
                    </section>)
                }
                {role === "freelancer" && status === MilestoneStatus.Completed && !data.milestone.reportURL && (
                    <Button caption="Upload Report" onClick={onUpload}/>
                )}
                {role === "client" && status === MilestoneStatus.Completed && (
                    <Button caption="Approve"/>
                )}
                </section>
                </article>
            </section>
        </Modal>
    );
}

export default ViewMilestones