import React from "react";
import Modal from "react-modal";
import './JobApplicationForm.css';

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
  company,
  jobTitle,
  budget,
  deadline,
  skills,
  
}) => {
    const initial = company.charAt(0).toUpperCase(); 
    const [modalIsOpen, setIsOpen] = React.useState(false);
    
    function openModal(){
        setIsOpen(true);
    }

    function closeModal(){
        console.log("Modal open state:", modalIsOpen);
        setIsOpen(false);
    }

  return (
    <section>
    <article onClick={openModal} className="m-5" aria-label={`${jobTitle} at ${company}`}>
    <section className="job-card bg-gray-800 group mt-6 grid w-[450px] grid-cols-12 space-x-1 overflow-hidden rounded-lg border border-blue-900 py-4 px-4 text-gray-700 shadow transition hover:shadow-lg">
      
      {/* Header Row */}
      <section className="col-span-12 flex justify-between items-center mb-2">

        {/* Icon and Job Title */}
        <section className="flex items-center space-x-3">
          <section className="w-10 h-10 rounded-full bg-purple-800 text-white flex items-center justify-center font-semibold text-base">
            {initial}
          </section>
          <h2 className="text-xl font-bold text-gray-300">{jobTitle}</h2>
        </section>
  
        {/* Deadline with Clock Icon */}
        <section className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <time className="text-sm text-gray-300">{deadline}</time>
        </section>
      </section>
  
      {/* Divider line under header */}
      <hr className="col-span-12 border-t border-gray-700 mb-3" />
  
      {/* Main Content */}
      <section className="col-span-12 space-y-4">
        {/* Budget */}
        <section className="text-sm font-medium text-gray-300">
          <strong className="font-semibold">Budget:</strong>
          <data className="ml-1 rounded-full bg-blue-900 px-2 py-0.5 text-blue-200">
            {budget}
          </data>
        </section>
  
        {/* Skills */}
        <section className="flex flex-wrap gap-2 text-sm font-medium text-gray-300">
          <strong className="font-semibold mr-2">Skills:</strong>
          {skills.map((skill, index) => (
            <data
              key={index}
              className="rounded-full bg-gray-700 px-3 py-0.5 text-sm text-gray-200"
            >
              {skill}
            </data>
          ))}
        </section>
  
        {/* Company and Deadline inline at the bottom */}
        <section className="flex justify-between items-center text-sm text-gray-400 pt-1 border-t border-gray-700 mt-2">
          <address className="italic">{company}</address>
        </section>
      </section>
    </section>

  </article>
  
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