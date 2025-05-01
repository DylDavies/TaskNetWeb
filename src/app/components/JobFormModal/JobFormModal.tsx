import React, {ChangeEvent, useContext} from "react";
import Button from "../button/Button";
import { AuthContextType, AuthContext } from "../../AuthContext";
import { AddApplication, makeApplicationID}from "@/app/server/services/ApplicationService";
import { createNotification } from "@/app/server/services/NotificationService";
import "./JobFormModal.css"
import InputBar from "../inputbar/InputBar";
import { uploadFile } from "@/app/server/services/DatabaseService";
import UploadComponent from "../FileUpload/FileUpload";
import toast from "react-hot-toast";
import formatDateAsNumber from "@/app/server/formatters/FormatDates";
import { FileText, X } from "lucide-react";

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
    const [estismatedTimeline, setEstismatedTimeline] = React.useState<Date>(new Date());
    const [jobID, setJobID] = React.useState("");
    const [CVURL, setCVURL] = React.useState("");
    const [fileName, setFileName] = React.useState("");
    const [showPdfPreview, setShowPdfPreview] = React.useState(false);
    
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

    const handleUploadComplete = (url: string, file: File) => {
      setCVURL(url);
      setFileName(file.name);
      // You can do more with the URL here, like save it to your database
    };

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
        
        // If all checks pass
        setEstismatedTimeline(newDate);
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

        // Validate Deadline
        const formattedDeadline = formatDateAsNumber(estismatedTimeline);
        if (formattedDeadline <= formatDateAsNumber(new Date())) {
          toast.error("Please ensure that the deadline is in the future");
          return;
        }

        await AddApplication(
            applicantID, 
            Number(bidAmount), 
            CVURL, 
            formatDateAsNumber(estismatedTimeline), 
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
      console.error("Application submission error:", error);
    }
    }

    const handleRemoveFile = () => {
      setCVURL("");
      setFileName("");
    };

    const togglePdfPreview = () => {
      setShowPdfPreview(!showPdfPreview);
    };
  

  return (
    <section className="fixed inset-0 flex items-center justify-center z-50 ">

      {/*rest of the main info */}
      <article className={`bg-neutral-800 rounded-xl p-6 shadow-xl text-white ${showPdfPreview ? 'w-full max-w-5xl' : 'w-full max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <section className="flex justify-between items-center mb-6">
          <header className="text-2xl font-bold text-white">
            {showPdfPreview ? `${fileName}` : `Apply for ${data.jobTitle}`}
          </header>
          <button 
            type="button" 
            onClick={showPdfPreview ? togglePdfPreview : onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </section>

        {showPdfPreview ? (
          <section className="h-[70vh] w-full">
            <iframe 
              src={CVURL} 
              className="w-full h-full border border-neutral-600 rounded-lg"
              title="PDF Preview"
            />
          </section>
        ) : (
          <>
            <section className="space-y-4">

              {/* Timeline */}
              <section className="mb-4">
                <label htmlFor="timeLine" className="block text-sm font-medium text-gray-300 mb-2">Estimated Timeline</label>
                <InputBar 
                  className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  type="date" 
                  value={estismatedTimeline.toISOString().split("T")[0]} 
                  onChange={handleDateChange}
                />
              </section>

              {/* Bid Amount */}
              <section className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bid Amount (R)</label>
                <InputBar 
                  type="number" 
                  min={1} 
                  placeholder="Enter your bid amount" 
                  value={bidAmount} 
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </section>

              {/* Cover Letter Upload */}
              <section className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Cover Letter (PDF)</label>
                <section className=" flex items-center">
                {!CVURL ? (
                  <UploadComponent
                    uploadFunction={uploadFile}
                    path="CV"
                    name={applicationID}
                    onUploadComplete={handleUploadComplete}
                  />
                ) : (
                  <section className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg border border-neutral-600">
                    <section 
                      className="flex items-center gap-3 cursor-pointer hover:bg-neutral-600 p-2 rounded transition-colors"
                      onClick={togglePdfPreview}
                    >
                      <FileText className="text-blue-400" />
                      <section className="text-sm text-gray-200 inline">{fileName}</section>
                    </section>
                    <button 
                      onClick={handleRemoveFile}
                      className="text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </section>
                )}
                </section>
              </section>

                    {/* Submit Button */}
                    <section className="flex justify-end">
                      <Button 
                        caption={"Submit Application"} 
                        onClick={handleApplicationSubmit}
                      />
                    </section>
                  </section>
                </>
        )}
      </article>

  </section>
  );
};


export default JobForm;