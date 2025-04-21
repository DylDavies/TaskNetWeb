import React, {useContext} from "react";
import Modal from "react-modal";
import './JobApplicationForm.css';
import Button from "../button/Button";
import { AuthContextType, AuthContext } from "../../AuthContext";
import { AddApplication, uploadCV }from "@/app/server/services/ApplicationService";

type JobData = {
  company: string;
  jobTitle: string;
  jobId: string;
};

type Props = {
    data : JobData
}

const JobForm: React.FC<Props> = ({data}) => {
    const { user } = useContext(AuthContext) as AuthContextType;
    const [applicantID, setApplicantID] = React.useState("");
    const [bidAmount, setBidAmount] = React.useState(0);
    const [CV, setCV] = React.useState<File | null>(null);
    const [estismatedTimeline, setEstismatedTimeline] = React.useState(0);
    const [jobID, setJobID] = React.useState("");
    const [CVURL, setCVURL] = React.useState("");
    const [modalIsOpen, setIsOpen] = React.useState(false);

    const handleUpload = async () => {
      const url = await uploadCV(CV!, applicantID);
      setCVURL(url);
    }

    const handleApplicationSubmit = (e: React.FormEvent) => 
    {
      e.preventDefault();
      if(user?.authUser.uid){
        setApplicantID(user?.authUser.uid);
      }
      handleUpload();
      setJobID(data.jobId);
      AddApplication(applicantID, bidAmount, CVURL, estismatedTimeline, jobID);
      closeModal();
    }
    
    /*function openModal(){
        setIsOpen(true);
    }*/

    function closeModal(){
        setIsOpen(false);
    }

  return (
    <section>
      <Modal 
        isOpen = {modalIsOpen}
        onRequestClose={closeModal}
        className={"Modal"}
        ariaHideApp={false}>
            <form>
            <button type="button" onClick={closeModal} className="Close">X</button> <br></br>
            <header>Job Application Form for {data.jobTitle} by {data.company}</header> <br></br>
            <label htmlFor="pdf">Please attach your cover letter</label><br></br>
                <input type="file" accept=".pdf" id ="pdf" name="pdf" onChange={(e) => {const file = e.target.files?.[0]; if(file){setCV(file);}}}></input><br></br>
                <label htmlFor="timeLine">Please write down your estimated time line</label><br></br>
                <input type="date" id="timeLine" name="timeLine" value ={estismatedTimeline} onChange={(e) => setEstismatedTimeline(Number(e.target.value))}></input><br></br>
                <label htmlFor="bid">Please write down your bid</label><br></br>
                <input type="text" id="bid" name ="bid" value={bidAmount} onChange={(e) => setBidAmount(Number(e.target.value))}></input><br></br>
                <Button caption = {"Submit"} onClick={() => handleApplicationSubmit}></Button>
            </form>
    </Modal>
    </section>
  );
};


export default JobForm;