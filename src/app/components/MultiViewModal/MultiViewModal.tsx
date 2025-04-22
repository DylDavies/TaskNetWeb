import {useState, useEffect} from "react";
import Modal from "react-modal";
import ViewJobModal from "../ViewJobModal/ViewJobModal";
import JobForm from "../JobFormModal/JobFormModal";
import ActiveJob from "@/app/interfaces/ActiveJob.interface";

type Props = {
    job : ActiveJob; 
    modalIsOpen: boolean; 
    onClose: () => void;
}

const MultiViewModal: React.FC<Props> = ({job, modalIsOpen, onClose}) => {
    const[view, setView] = useState<"viewA" | "viewB">("viewA");
    const [formData, setFormData] = useState<JobFormData>();
    const [viewData, setViewData] = useState<JobViewData>();

    useEffect(() => {
      if(modalIsOpen){
        setFormData({company: job.jobData.clientUId, jobTitle: job.jobData.title, jobId: job.jobId});
        setViewData({title: job.jobData.title, company: job.jobData.title, companyImage: "", description: job.jobData.description, minBudget: String(job.jobData.budgetMin), maxBudget: String(job.jobData.budgetMax), deadline: String(job.jobData.deadline), status: String(job.jobData.status), skills: Object.values(job.jobData.skills).flat()});
      }
    }, [modalIsOpen, job]); 

    type JobFormData = {
        company: string;
        jobTitle: string;
        jobId: string;
      };
    
      interface JobViewData {
        title: string;
        company: string;
        companyImage: string;
        description: string;
        minBudget: string;
        maxBudget: string;
        deadline: string;
        status: string;
        skills: string[]; // Added skills array
      }

    const ViewA = () => {
        if(viewData){
            return(
            <ViewJobModal
            job = {viewData}
            onApply={openApplyModal}
            onClose={onClose}/>
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

    const openApplyModal = () =>{
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