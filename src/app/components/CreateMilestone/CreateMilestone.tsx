'use client';

import React, { useState, useEffect, ChangeEvent, useContext } from "react";
//import { AuthContext, AuthContextType } from "@/app/AuthContext";
import Modal from "react-modal";
import formatDateAsNumber from "@/app/server/formatters/FormatDates";
import toast from "react-hot-toast";
import InputBar from "../inputbar/InputBar"; 
import Button from "../button/Button";
import "../button/Button.css";
import "../inputbar/inputBar.css";
import "./CreateMilestone.css";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import {  sanitizeMilestoneData } from "@/app/server/formatters/MilestoneDataSanitization";
import { addMilestone, getMilestones } from "@/app/server/services/MilestoneService";
import { JobContext, JobContextType } from "@/app/JobContext";
import MilestoneData from "@/app/interfaces/Milestones.interface";

 interface Props {
     refetch: () => void
 }


const CreateMilestone = ({refetch}: Props) => {
    const { jobID } = useContext(JobContext) as JobContextType;
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState<Date>(new Date());
    const [payment, setPayment] = useState("");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [existingMilestones, setExistingMilestones] = useState<MilestoneData[]>([]);

    useEffect(() => {
        Modal.setAppElement("#root");
    }, []);

    async function openModal() {
        if (!jobID) {
            toast.error("Job ID is missing");
            return;
        }
        try {
            // Fetch existing milestones when modal opens
            const milestones = await getMilestones(jobID);
            setExistingMilestones(milestones);
            setIsOpen(true);
        } catch (error) {
            console.error("Error fetching milestones:", error);
            toast.error("Failed to load existing milestones");
        }
    }
    
    function closeModal() {
        setIsOpen(false);
    }
    const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        
        // Basic check if input is empty
        if (!inputValue) {
            toast.error("Please select a date");
            return;
        }
        
        // Parse the date
        const newDate = new Date(inputValue);
        
        // Check if date is valid
        if (isNaN(newDate.getTime())) {
            toast.error("Invalid date format");
            return;
        }
        //  Check against existing milestones (if any)
        if (existingMilestones.length > 0) {
            const latestMilestoneDate = new Date(Math.max(...existingMilestones.map(m => m.deadline)));
            if (newDate < latestMilestoneDate) {
                toast.error("New milestone deadline cannot be earlier than existing milestones");
                return;
            }
        }

        //  Check if deadline is in the future
        if (newDate <= new Date()) {
            toast.error("Please ensure the deadline is in the future");
            return;
        }
        
        // If all checks pass
        setDeadline(newDate);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const status = MilestoneStatus.OnHalt;

        if (title === "") {
            toast("Please enter a title for the job");
            return;
        }
          // Validate description
        if (description === "") {
            toast("Please enter a description for the job");
            return;
        }

        let pay= 0 
        try {
            pay= parseInt(payment);
            if (isNaN(pay)) {
                toast.error("Please enter a payment value");
                return;
            }
            if (pay === 0) {
                toast.error("Please enter a non zero number for the payment");
                return;
            }
        } catch (error) {
            console.error("Error parsing budgets:", error);
        }

        const formattedDeadline = formatDateAsNumber(deadline);

        if (formattedDeadline <= formatDateAsNumber(new Date())) {
            toast.error("Please ensure that the deadline is in the future");
            return;
        }

        //reportURL = "";
        const milestone = {
        title,
        description,
        payment: pay,
        deadline: formattedDeadline,
        reportURL:"",
        status
    
        };

        let sanitizedMilestoneData 
        try{
            sanitizedMilestoneData = sanitizeMilestoneData(milestone);
        }catch (err){
            console.error("Milestone data validation failed: ", err);
            return;
        }
        const confirmed = window.confirm(
            "Are you sure you want to create this milestone with the details provided?"

        );
        
        
        if(!confirmed || !jobID){
            return;
        }
        try {
            await addMilestone(jobID,sanitizedMilestoneData);
            toast.success("Milestone created successfully!");
            refetch();
            closeModal(); // Close the modal after successful creation

            // Reset fields
            setTitle("");
            setDescription("");
            setDeadline(new Date());
            setPayment("");
            
        } catch (err) {
            toast.error("Something went wrong when trying to create the milestone");
            console.error(err);
          }
        };

          

    

    

    return (
        <section id="root">
        <Button caption={"Create Milestone"} onClick={openModal}/>
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            className=" rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
            overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-40 flex items-center justify-center"
        >
        <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 ">
            <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
            <section className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create a MileStone</h2>
                <button
                onClick={closeModal}
                className="text-white text-xl hover:text-red-400"
                >
                    ×
                </button>
            </section>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputBar
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Milestone Title"
                type="text"
            />
            <textarea
                placeholder="Milestone Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="job-description"
                rows={4}
                style={{
                    width: "100%",
                    minHeight: "150px",
                    boxShadow: "0 0 0 1.5px #2b2c37, 0 0 25px -17px #000",
                    border: "0",
                    borderRadius: "12px",
                    backgroundColor: "#26272c",
                    outline: "none",
                    color: "white",
                    padding: "12px",
                    transition: "all 0.25s cubic-bezier(0.19, 1, 0.22, 1)",
                    cursor: "text",
                }}
              />
              <section className="flex items-center gap-2 mb-2">
                <label className="text-sm font-medium">Payment</label>
                <section className="flex gap-2">
                    <input
                        value={payment}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (!value || parseFloat(value) >= 0) {
                                setPayment(value);
                            }
                        }}
                        placeholder="Payment"
                        type="number"
                        className="input"
                        style={{ width: "120px", paddingLeft: "12px" }}
                    />
                </section>
            </section>
                <InputBar
                    value={deadline.toISOString().split("T")[0]} // Only pass yyyy-mm-dd to the input field
                    onChange={(e) => handleDateChange(e)} // Handle input as full Date
                    placeholder="Deadline"
                    type="date"
                />
            <section>
            </section>
                <section className="flex justify-end">
                    <Button caption={"Submit"} />
            </section>
            </form>
        </article>
        </section>
        </Modal>
    </section>
    );
};


export default CreateMilestone;


