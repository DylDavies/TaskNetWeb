'use client';

import Modal from "react-modal";
import React, { useEffect } from "react";
import "./clientModal.css";
import { getJob } from "@/app/server/services/JobDatabaseService";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";

interface Applicants {
  JobID: string;
  ApplicantID: string;
  ApplicationDate: number;
  CVURL: string;
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
  const [jobTitle, setJobTitle] = React.useState<string>("");

  /*useEffect(() => {
    Modal.setAppElement("#root");
  }, []);*/
  if (typeof window !== "undefined") {
    Modal.setAppElement(document.body); // You can also use "#__next" if your layout root uses that
  }

  useEffect(() => {
    const fetchJobTitle = async () => {
      if (data.JobID) {
        const jobData = await getJob(data.JobID);
        if (jobData?.title) {
          setJobTitle(jobData.title);
        }
      }
    };

    if (isOpen) {
      fetchJobTitle();
    }
  }, [isOpen, data.JobID]);

  useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen]);

  function closeModal() {
    setIsOpen(false);
    onClose();
  }
  

  return (
    <section id="root">
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-60"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
      >
        <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
          <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
            <section className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Application Details</h2>
              <button
                onClick={closeModal}
                className="text-white text-xl hover:text-red-400"
              >
                ×
              </button>
            </section>

            <section className="space-y-4">
              <section>
                <h3 className="font-semibold">Job Title</h3>
                <p>{jobTitle || data.JobID}</p>
              </section>

              <section>
                <h3 className="font-semibold">Estimated Timeline</h3>
                <p>{formatDateAsString(data.EstimatedTimeline)}</p>
              </section>

              <section>
                <h3 className="font-semibold">Bid Amount</h3>
                <p>R{data.BidAmount}</p>
              </section>

              <section>
                <h3 className="font-semibold">Applicant Name</h3>
                <p>{data.username}</p>
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
          </article>
        </section>
      </Modal>
    </section>
  );
};


export default ClientModal;