import Modal from "react-modal";
import React, { useEffect } from "react";
import "./clientModal.css"
//import "./global.css"

interface Applicants  {
    JobID: string;
    ApplicantID: string;
    ApplicationDate: number;
    CVURL: string,
    BidAmount: number;
    EstimatedTimeline: number;
    Status: number;  
    username: Promise<string>;
}

interface Props {
    data: Applicants;
    isOpen: boolean;
    onClose: () => void; 
  }

  const ClientModal: React.FC<Props> = ({ data, isOpen, onClose }) => {
    const [modalIsOpen, setIsOpen] = React.useState(isOpen);

    /*function openModal(){
        setIsOpen(true);
    }*/

    useEffect(() => {
        setIsOpen(isOpen);
    }, [isOpen]);

    function closeModal() {
        setIsOpen(false);
        onClose(); // Call the onClose callback
    }
    
    return(
         
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}>
        <section className="p-6 rounded-xl shadow-md bg-gray-900 text-white max-w-xl mx-auto space-y-6">
            <header>
                <h2 className="text-3xl font-bold">Application Details</h2>
            </header>

            <section>
                <h3 className="font-semibold">Job ID</h3>
                <p>{data.JobID}</p>
            </section>

            <section>
                <h3 className="font-semibold">Estimated Timeline</h3>
                <p>{data.EstimatedTimeline}</p>
            </section>

            <section>
                <h3 className="font-semibold">Bid Amount</h3>
                <p>R{data.BidAmount}</p>
            </section>

            <section>
                <h3 className="font-semibold">Applicant ID</h3>
                <p>{data.ApplicantID}</p>
            </section>

            <section>
                <h3 className="font-semibold">CV</h3>
                <iframe
                    src={data.CVURL}
                    title="Applicant CV"
                    width="100%"
                    height="500px"
                    className="rounded border border-gray-700 mt-2"
                ></iframe>
                <nav className="mt-2">
                <a
                    href={data.CVURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                >
                    Download CV
                </a>
            </nav>
            </section>
            </section>
          </Modal>
    );
};

export default ClientModal;