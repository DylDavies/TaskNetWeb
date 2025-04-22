import React, {useContext} from "react";
import Button from "../button/Button";
import { AuthContextType, AuthContext } from "../../AuthContext";
import { AddApplication, makeApplicationID}from "@/app/server/services/ApplicationService";
import { createNotification } from "@/app/server/services/NotificationService";
import "./JobFormModal.css"
import InputBar from "../inputbar/InputBar";
import { uploadFile } from "@/app/server/services/DatabaseService";
import UploadComponent from "../FileUpload/FileUpload";
import toast from "react-hot-toast";
import { convertDateStringToNumber } from "@/app/server/formatters/FormatDates";

type JobData = {
  company: string;
  jobTitle: string;
  jobId: string;
};

type Props = {
    data : JobData,
    onClose: () => void; 
}

const JobForm: React.FC<Props> = ({data, onClose}) => {
    const { user } = useContext(AuthContext) as AuthContextType;
    const [applicantID, setApplicantID] = React.useState("");
    const [bidAmount, setBidAmount] = React.useState("");
    const [estismatedTimeline, setEstismatedTimeline] = React.useState("");
    const [jobID, setJobID] = React.useState("");
    const [CVURL, setCVURL] = React.useState("");
    
    React.useEffect(() => {
      if (user?.authUser?.uid) {
        setApplicantID(user.authUser.uid);
      }
    }, [user]); // Only run when user changes
    
    React.useEffect(() => {
      setJobID(data.jobId);
    }, [data.jobId]); // Only run when jobId changes
    
    // Derived application ID (no need for useEffect)
    const applicationID = applicantID && jobID ? makeApplicationID(jobID, applicantID) : " ";

    const handleUploadComplete = (url: string) => {
      setCVURL(url);
      // You can do more with the URL here, like save it to your database
    };

    const handleApplicationSubmit = async () => 
    {
      try {
        if (!CVURL) {
          toast.error("Please upload your CV first");
          return;
        }

        if(!bidAmount){
          toast.error("Please enter a bid amount first");
          return;
        }

        if (isNaN(parseInt(bidAmount)) || parseInt(bidAmount) < 0) {
          toast.error("Please input a valid bid amount");
          return;
        }

        if(!estismatedTimeline){
          toast.error("Please enter your estimated timeline");
          return;
        }

        await AddApplication(
            applicantID, 
            Number(bidAmount), 
            CVURL, 
            convertDateStringToNumber(estismatedTimeline), 
            jobID
        );


        await createNotification({
            message: `Pending Application for ${data.jobTitle}`, 
            seen: false, 
            uidFor: applicantID
        });
        toast.success("Application submitted successfuly!")
        onClose();
    } catch (error) {
      toast.error("Submission failed, please try again");
      console.error("Application sibmission error:", error);
    }
    }

  return (
          <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 ">
            <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
            <section className="flex justify-between items-center mb-4">
                <header className="text-xl font-bold">Job Application Form: {data.jobTitle}</header>
                <button type="button" onClick={onClose} className="text-white text-xl hover:text-red-400">x</button>
            </section>
           
              <section className="flex items-center gap-2 mb-2">
                <label htmlFor="pdf">Cover Letter</label><br></br>
                <UploadComponent
                  uploadFunction={uploadFile}
                  path="CV"
                  name={applicationID}
                  onUploadComplete={handleUploadComplete}
                />
              </section>

                <section className="flex items-center gap-2 mb-2">
                  <label htmlFor="timeLine" className="text-ms font-medium">Timeline</label>
                  <InputBar type="date" value ={estismatedTimeline} onChange={(e) => setEstismatedTimeline(e.target.value)}/>
                </section>

                <section className="flex items-center gap-2 mb-2">
                  <InputBar type="number" min={1} placeholder="Bid value" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)}/>
                </section>
                <section className="flex justify-end">
                  <Button caption = {"Submit"} onClick={handleApplicationSubmit}></Button>
                </section>

            </article>
          </section>
  );
};


export default JobForm;