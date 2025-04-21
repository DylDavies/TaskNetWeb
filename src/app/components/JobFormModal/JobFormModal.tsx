import React, {useContext} from "react";
import Modal from "react-modal";
import Button from "../button/Button";
import { AuthContextType, AuthContext } from "../../AuthContext";
import { AddApplication, uploadCV }from "@/app/server/services/ApplicationService";
import { createNotification } from "@/app/server/services/NotificationService";
import "./JobFormModal.css"
import InputBar from "../inputbar/InputBar";

type JobData = {
  company: string;
  jobTitle: string;
  jobId: string;
};

type Props = {
    data : JobData,
    isOpen : boolean,
    onClose: () => void; 
}

const JobForm: React.FC<Props> = ({data, isOpen, onClose}) => {
    const { user } = useContext(AuthContext) as AuthContextType;
    const [applicantID, setApplicantID] = React.useState("");
    const [bidAmount, setBidAmount] = React.useState("");
    const [CV, setCV] = React.useState<File | null>(null);
    const [estismatedTimeline, setEstismatedTimeline] = React.useState("");
    const [jobID, setJobID] = React.useState("");
    const [CVURL, setCVURL] = React.useState("");

    const [modalIsOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
            setIsOpen(isOpen);
    }, [isOpen]);

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
      AddApplication(applicantID, Number(bidAmount), CVURL, Number(estismatedTimeline), jobID);
      createNotification({message: `Pending Application for ${data.jobTitle}`, seen: false, uidFor: applicantID});
      onClose();
    }

  return (
      <Modal 
        isOpen = {modalIsOpen}
        onRequestClose={onClose}
        className=" rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
        overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-[100] flex items-center justify-center">
          <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 ">
            <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
            <section className="flex justify-between items-center mb-4">
                <header className="text-xl font-bold">Job Application Form: {data.jobTitle}</header>
                <button type="button" onClick={onClose} className="text-white text-xl hover:text-red-400">x</button>
            </section>
            <form  className="flex flex-col gap-1">
              <section className="flex items-center gap-2 mb-2">
                <label htmlFor="pdf">CV</label><br></br>
                <input type="file" accept=".pdf" id ="pdf" name="pdf" onChange={(e) => {const file = e.target.files?.[0]; if(file){setCV(file);}}}></input><br></br>
              </section>

                <section className="flex items-center gap-2 mb-2">
                  <label htmlFor="timeLine" className="text-ms font-medium">Timeline</label>
                  <InputBar type="date" value ={estismatedTimeline} onChange={(e) => setEstismatedTimeline(e.target.value)}/>
                </section>

                <section className="flex items-center gap-2 mb-2">
                  <InputBar type="text" placeholder="Bid value" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}/>
                </section>

                <section className="flex justify-end">
                  <Button caption = {"Submit"} onClick={() => handleApplicationSubmit}></Button>
                </section>

            </form>
            </article>
          </section>
    </Modal>
  );
};


export default JobForm;