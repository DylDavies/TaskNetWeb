import React from "react";
import Modal from "react-modal";
import './JobApplicationForm.css';
import JobOverview from "../JobOverview/JobOverview";

/*
--- NOTE ON USE ---

import JobOverview from "../components/JobOverview/JobOverview";

example:

<Button 

  const jobData = {
    company: "Company name",
    jobTitle: "Title of job",
    budget: "180k - 250k",
    deadline: "30 April 2025",
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Git"],
  };

  where you want to place the card, call this: <JobOverview {...jobData} />


  You must pass the card :
  - company: string;
  -jobTitle: string;
  -budget: string;
  -deadline: string;
  -skills: string[];
/>


*/


type JobCardProps = {
  company: string;
  jobTitle: string;
  budget: string;
  deadline: string;
  skills: string[];
};

const JobForm: React.FC<JobCardProps> = ({
  jobTitle,
  
}) => {
    const [modalIsOpen, setIsOpen] = React.useState(false);

    const jobData = {
      company: "Company name",
      jobTitle: "Title of job",
      budget: "180k - 250k",
      deadline: "30 April 2025",
      skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Git"],
    };
    
    function openModal(){
        setIsOpen(true);
    }

    function closeModal(){
        console.log("Modal open state:", modalIsOpen);
        setIsOpen(false);
    }

  return (
    <section>
      <JobOverview onClick={openModal} {...jobData} />
      <Modal 
        isOpen = {modalIsOpen}
        onRequestClose={closeModal}
        className={"Modal"}
        ariaHideApp={false}>
            <form>
            <button type="button" onClick={closeModal} className="Close">X</button> <br></br>
            <header>Job Application Form for {jobTitle}</header> <br></br>
            <label htmlFor="pdf">Please attach your cover letter</label><br></br>
                <input type="file" accept=".pdf" id ="pdf" name="pdf"></input><br></br>
                <label htmlFor="timeLine">Please write down your estimated time line</label><br></br>
                <input type="date" id="timeLine" name="timeLine"></input><br></br>
                <label htmlFor="bid">Please write down your bid</label><br></br>
                <input type="text" id="bid" name ="bid"></input><br></br>
                <button type ="submit" onClick={closeModal}>Submit</button>
            </form>
    </Modal>
    </section>
  );
};


export default JobForm;