"use client";

//import { updateMilestoneStatus } from "@/app/server/services/MilestoneService";
import { useState, useContext, useEffect } from "react";
import Button from "../button/Button";
import { AuthContext, AuthContextType } from "../../AuthContext";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import Modal from "react-modal";
import { updateMilestoneStatus } from "@/app/server/services/MilestoneService";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
import toast from "react-hot-toast";

type JobData = {
    jobId: string;
    clientUID: string;
    milestone: { 
        id: string;
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
      refetchMilestones: () => void;
  }

const ViewMilestones: React.FC<Props> = ({data, onClose, onUpload, modalIsOpen, refetchMilestones}) => {
    const { user } = useContext(AuthContext) as AuthContextType;
    const [status, setStatus] = useState<MilestoneStatus>(data.milestone.status);
    const [role, setRole] = useState("client");
    const [isApproving, setIsApproving] = useState(false);

    useEffect(() =>{
        if(user?.authUser?.uid == data.clientUID){
            setRole("client");
        }
        else{
            setRole("freelancer");
        }
    }, [user, data.clientUID]);

    useEffect(() => {
        setStatus(data.milestone.status);
      }, [data.milestone]);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedStatus = e.target.value as keyof typeof MilestoneStatus;
        const confirmed = window.confirm(
            `Are you sure you want to change status to ${e.target.id}`
          );
          if (!confirmed) {
            return;
          }
          const enumValue = MilestoneStatus[selectedStatus];
          if(enumValue === undefined) return;
          try{
            await updateMilestoneStatus(data.jobId, data.milestone.id, enumValue);
            setStatus(enumValue);
            refetchMilestones();
          } catch(err){
            console.log("Error updating milestone:", err);
          }
    }
    function MilestoneStatusToString(value: MilestoneStatus| undefined): string {
        if (value === undefined) return 'Unknown';
        return MilestoneStatus[value] || '...';
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
                        <p className="text-sm text-gray-300">{formatDateAsString(data.milestone.deadline)}</p>
                    </section>
                    
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Payment</h4>
                        <p className="text-sm text-gray-300">$ {data.milestone.payment}</p>
                    </section>

                {data.milestone.reportURL ? (
                    <text>{data.milestone.reportURL}</text>
                ): null}
                {role === "freelancer" && status !== MilestoneStatus.Completed && (
                    <section>
                        <fieldset>
                            <legend>Select Status</legend>
                            <section>
                                <input type ="radio" id="Pending" name="status" value="OnHalt" onChange={handleStatusChange} checked={status === MilestoneStatus.OnHalt}/>
                                <label htmlFor="Pending"> Pending</label>
                            </section>
                            <section>
                                <input type ="radio" id="In Progress" name="status" value="InProgress" onChange={handleStatusChange} checked={status === MilestoneStatus.InProgress}/>
                                <label htmlFor="InProgress"> In Progress</label>
                            </section>
                            <section>
                                <input type ="radio" id="Completed" name="status" value="Completed" onChange={handleStatusChange}/>
                                <label htmlFor="Completed"> Completed</label>
                            </section>
                        </fieldset>
                    </section>)
                }
                {role === "freelancer" && status === MilestoneStatus.Completed && !data.milestone.reportURL && (
                    <Button caption="Upload Report" onClick={onUpload}/>
                )}
                {role === "client" && status === MilestoneStatus.Completed && (
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Freelancer progress report/review</h4>
            
                        <nav className="mt-2 text-sm">
                            {data.milestone.reportURL ? (
                                <a
                                    href={data.milestone.reportURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                >
                                    Download the freelancers progress report
                                </a>
                            ) : (
                                <output className="text-gray-500 italic">
                                    No report was uploaded for this milestone
                                </output>
                                )}
                        </nav>
                        <Button 
                            caption={isApproving ? "Approving..." : "Approve"}
                            onClick={async () => {
                                setIsApproving(true);
                                try {
                                    await updateMilestoneStatus(data.jobId, data.milestone.id, 3);
                                    refetchMilestones();
                                    toast.success("Milestone approved successfully");
                                    onClose(); 
                                } catch (error) {
                                    console.error("Error approving milestone:", error);
                                    toast.error("Failed to approve milestone");
                                } finally {
                                    setIsApproving(false);
                                }
                            }}
    
                        />
                        
                    </section>
                    
                )}
                {((role === "client" && status === MilestoneStatus.OnHalt)||(role === "client" && status === MilestoneStatus.InProgress)) && (
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Freelancer progress report/review</h4>
                        <p className="text-sm text-gray-300">This milestone is currently {MilestoneStatusToString(status)} so there is no progress report to review yet</p>
                    </section>   
                )}
                {(role === "client" && status === MilestoneStatus.Approved) && (
                    <section>
                        <h4 className="font-semibold text-sm mb-1">Freelancer progress report/review</h4>
                        <p className="text-sm text-gray-300">You have already approved this milestone but can still view the progress report here: </p>
                        <nav className="mt-2 text-sm">
                            {data.milestone.reportURL ? (
                                <a
                                    href={data.milestone.reportURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                >
                                    Download the freelancers progress report
                                </a>
                            ) : (
                                <output className="text-gray-500 italic">
                                    No report was uploaded for this milestone
                                </output>
                                )}
                        </nav>
                    </section>
                    
                )}
                {/* Incase we want to display a preview, here is how we will do it
                <iframe
                  src={data.milestone.reportURL}
                  title="Freelancer progress report"
                  width="100%"
                  height="500px"
                  className="rounded border border-gray-700 mt-2"
                ></iframe>*/}
              
                </section>
                </article>
            </section>
        </Modal>
    );
}

export default ViewMilestones