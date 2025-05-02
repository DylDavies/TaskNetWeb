import {useState, useEffect, useContext} from "react";
import Modal from "react-modal";
import ViewJobModal from "../ViewJobModal/ViewJobModal";
import JobForm from "../JobFormModal/JobFormModal";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
import { hasApplied, makeApplicationID } from "@/app/server/services/ApplicationService";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { rejectApplicant } from "@/app/server/services/ApplicationDatabaseServices";

type Props = {
    job : ActiveJob; 
    modalIsOpen: boolean; 
    onClose: () => void;
}

const MultiViewModal: React.FC<Props> = ({job, modalIsOpen, onClose}) => {
    const[view, setView] = useState<"viewA" | "viewB">("viewA");
    const [formData, setFormData] = useState<JobFormData>();
    const [viewData, setViewData] = useState<JobViewData>();

    const [applied, setApplied] = useState(false);

    const { user } = useContext(AuthContext) as AuthContextType;

    useEffect(() => {
      if(modalIsOpen){
        setFormData({company: job.jobData.clientUId, jobTitle: job.jobData.title, jobId: job.jobId});
        setViewData({title: job.jobData.title, company: job.jobData.title, description: job.jobData.description, minBudget: job.jobData.budgetMin, maxBudget: job.jobData.budgetMax, deadline: formatDateAsString(job.jobData.deadline), skills: Object.values(job.jobData.skills).flat()});
      }

      (async () => {
        setApplied(await hasApplied(user?.authUser.uid || "", job.jobId));
      })();
    }, [modalIsOpen, job, user]); 

    type JobFormData = {
        company: string;
        jobTitle: string;
        jobId: string;
      };
    
      interface JobViewData {
        title: string;
        company: string;
        description: string;
        minBudget: number;
        maxBudget: number;
        deadline: string;
        skills: string[]; // Added skills array
      }

    const ViewA = () => {
        if(viewData){
            return(
            <ViewJobModal
            job = {viewData}
            onApply={openApplyModal}
            onClose={onClose}
            applied={applied}/>
        );}
    };

    const ViewB = () => {
        if(formData){
            return(
            <JobForm
            data={formData}
            onClose={onClose}/> 
        );}
    };

    const openApplyModal = async () => {
        if (applied) {
            rejectApplicant(makeApplicationID(job.jobId, user?.authUser.uid || ""));
        }

        setView("viewB");
    }

    return(
        <Modal
        isOpen = {modalIsOpen}
        onRequestClose={onClose}
        className=" rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
        overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-[100] flex items-center justify-center"
        ariaHideApp={false}>
            {view === "viewA" ? <ViewA/> : <ViewB/>}
        </Modal>
    );
};

export default MultiViewModal;