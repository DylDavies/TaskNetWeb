import Modal from "react-modal";
import React from "react";
import "./clientModal.css"
import "./global.css"

interface Applicants  {
    JobID: string;
    applicationID: string;
    ApplicationDate: number;
    CVURL: string,
    BidAmount: number;
    EstimatedTimeline: number;
    Status: number;  
    username: Promise<string>;
}

interface Props {
    data: Applicants;
    onClick?: (user: Applicants) => void;
  }

const ClientModal:  React.FC<Props> = ({data})=> {

    const[modalIsOpen, setIsOpen] = React.useState(false);
    /*function openModal(){
        setIsOpen(true);
    }*/

    function closeModal(){
        setIsOpen(false);
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
                <p>{data.applicationID}</p>
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