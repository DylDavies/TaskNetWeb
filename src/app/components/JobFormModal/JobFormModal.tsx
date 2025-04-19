import React from "react";
import Modal from "react-modal";
import './JobApplicationForm.css';
import Button from "../button/Button";

type JobData = {
  company: string;
  jobTitle: string;
  budget: string;
  deadline: string;
  skills: string[];
};

type Props = {
    data : JobData
}

const JobForm: React.FC<Props> = ({data}) => {
    const [modalIsOpen, setIsOpen] = React.useState(false);
    
    function openModal(){
        setIsOpen(true);
    }

    function closeModal(){
        setIsOpen(false);
    }

    /*function submitForm(jobData: jobData){
      createJob(jobData);
      setIsOpen(false);
    }*/

  return (
    <section>
      <Modal 
        isOpen = {modalIsOpen}
        onRequestClose={closeModal}
        className={"Modal"}
        ariaHideApp={false}>
            <form>
            <button type="button" onClick={closeModal} className="Close">X</button> <br></br>
            <header>Job Application Form for {data.jobTitle}</header> <br></br>
            <label htmlFor="pdf">Please attach your cover letter</label><br></br>
                <input type="file" accept=".pdf" id ="pdf" name="pdf"></input><br></br>
                <label htmlFor="timeLine">Please write down your estimated time line</label><br></br>
                <input type="date" id="timeLine" name="timeLine"></input><br></br>
                <label htmlFor="bid">Please write down your bid</label><br></br>
                <input type="text" id="bid" name ="bid"></input><br></br>
                <Button caption = {"Submit"} onClick={closeModal}></Button>
            </form>
    </Modal>
    </section>
  );
};


export default JobForm;