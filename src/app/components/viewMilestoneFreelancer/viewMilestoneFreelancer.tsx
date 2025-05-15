"use client";

//import { updateMilestoneStatus } from "@/app/server/services/MilestoneService";
import { useState, useContext, useEffect } from "react";
import Button from "../button/Button";
import { AuthContext, AuthContextType } from "../../AuthContext";
import MilestoneStatus from "@/app/enums/MilestoneStatus.enum";
import Modal from "react-modal";
import {
  updateMilestonePaymentStatus,
  updateMilestoneStatus,
} from "@/app/server/services/MilestoneService";
import { addReportURL } from "@/app/server/services/MilestoneService";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
import toast from "react-hot-toast";
import MilestoneData from "@/app/interfaces/Milestones.interface";
import PaymentStatus from "@/app/enums/PaymentStatus.enum";
import PayPalWrapper from "@/app/PayPalWrapper";
import RequestPayout from "../RequestPayout/RequestPayout";
import UploadComponent from "../FileUpload/FileUpload";
import { uploadFile } from "@/app/server/services/DatabaseService";
import { FileText, X } from "lucide-react";
import { createNotification } from "@/app/server/services/NotificationService";
import ChatLink from "../ChatLink/ChatLink";
import { useChatStore } from "@/app/stores/chatStore";
import JobWithUser from "@/app/interfaces/JobWithOtherUser.interface";
import JobStatus from "@/app/enums/JobStatus.enum";

type JobData = {
    jobId: string;
    jobStatus:JobStatus;
    clientUID: string;
    milestone: MilestoneData;
  };

type Props = {
  data: JobData;
  onClose: () => void;
  onUpload: () => void;
  modalIsOpen: boolean;
  refetch: () => void;
};

const ViewMilestones: React.FC<Props> = ({
  data,
  onClose,
  modalIsOpen,
  refetch,
}) => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [status, setStatus] = useState<MilestoneStatus>(data.milestone.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | undefined>(
    data.milestone.paymentStatus
  );
  const [role, setRole] = useState("client");
  const [reportURL, setreportURL] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const { jobsWithUsers } = useChatStore();
  const [jobWithUser, setJobWithUser] = useState<JobWithUser | null>(null);

  useEffect(() => {
    if (user?.authUser?.uid == data.clientUID) {
      setRole("client");
    } else {
      setRole("freelancer");
    }
  }, [user, data.clientUID]);

  useEffect(() => {
    setStatus(data.milestone.status);
    setPaymentStatus(data.milestone.paymentStatus);
    refetch();
  }, [data.milestone]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedStatus = e.target.value as keyof typeof MilestoneStatus;
    const confirmed = window.confirm(
      `Are you sure you want to change status to ${e.target.id}`
    );
    if (!confirmed) {
      return;
    }
    const enumValue = MilestoneStatus[selectedStatus];
    if (enumValue === undefined) return;
    try {
      await updateMilestoneStatus(data.jobId, data.milestone.id, enumValue);
      setStatus(enumValue);
      refetch();
    } catch (err) {
      console.log("Error updating milestone:", err);
    }
  };
  function MilestoneStatusToString(value: MilestoneStatus | undefined): string {
    if (value === undefined) return "Unknown";
    return MilestoneStatus[value] || "...";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleSuccessfulPayment(details: any) {
    console.log(details);
    if (details.status == "COMPLETED") {
      updateMilestonePaymentStatus(
        data.jobId,
        data.milestone.id,
        PaymentStatus.Escrow
      );
      setPaymentStatus(PaymentStatus.Escrow);
      refetch();
    }
  }

  function handleSuccessfulPayout() {
    setPaymentStatus(PaymentStatus.Paid);
    refetch();
  }

  const handleUploadComplete = (url: string, file: File) => {
    setreportURL(url);
    setFileName(file.name);
    // You can do more with the URL here, like save it to your database
  };
  const togglePdfPreview = () => {
    setShowPdfPreview(!showPdfPreview);
  };
  const handleRemoveFile = () => {
    setreportURL("");
    setFileName("");
  };

  const handleReportSubmit = async () => {
    try {
      if (!reportURL) {
        toast.error("Please upload your Report first");
        return;
      }

      await addReportURL(data.jobId, data.milestone.id, reportURL);

      // Create a notification for the client
      await createNotification({
        message: `Milestone report submitted for "${data.milestone.title}"`,
        seen: false,
        uidFor: data.clientUID,
      });

      toast.success("Report submitted successfully!");
      refetch(); // Refresh milestone data
      onClose(); // Close modal
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Submission failed. Please try again.");
    }
  };

  // get this jobWithUser
  useEffect(() => {
    // Since jobId is fixed, we find the jobWithUser when the component mounts or when jobsWithUsers changes
    const foundJobWithUser = jobsWithUsers.find(
      (job: { job: { jobId: string; }; }) => job.job.jobId === data.jobId
    );

    if (foundJobWithUser) {
      setJobWithUser(foundJobWithUser);
    }
  }, [jobsWithUsers, data.jobId]);

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={onClose}
      className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-60"
      overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
      ariaHideApp={false}
    >
      <section className="fixed inset-0 flex items-center justify-center z-50">
        <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Milestone Details</h2>
            <button
              onClick={onClose}
              className="text-white text-xl hover:text-red-400"
            >
              ×
            </button>
          </section>
          <section className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold">{data.milestone.title}</h3>
            <section>
              <h4 className="font-semibold text-sm mb-1">Description</h4>
              <p className="text-sm text-gray-300">
                {data.milestone.description}
              </p>
            </section>
            <section>
              <h4 className="font-semibold text-sm mb-1">Deadline</h4>
              <p className="text-sm text-gray-300">
                {formatDateAsString(data.milestone.deadline)}
              </p>
            </section>

            <section>
              <h4 className="font-semibold text-sm mb-1">Payment</h4>
              <p className="text-sm text-gray-300">
                $ {data.milestone.payment}
              </p>
            </section>
            {role === "freelancer" &&
              (status !== MilestoneStatus.Completed &&
              status !== MilestoneStatus.Approved)
              && (data && data.jobStatus === JobStatus.InProgress) && (
                <section>
                  <fieldset>
                    <legend>Select Status</legend>
                    <section>
                      <input
                        type="radio"
                        id="OnHalt"
                        name="status"
                        value="OnHalt"
                        onChange={handleStatusChange}
                        checked={status === MilestoneStatus.OnHalt}
                      />
                      <label htmlFor="OnHalt"> On Halt</label>
                    </section>
                    <section>
                      <input
                        type="radio"
                        id="In Progress"
                        name="status"
                        value="InProgress"
                        onChange={handleStatusChange}
                        checked={status === MilestoneStatus.InProgress}
                      />
                      <label htmlFor="InProgress"> In Progress</label>
                    </section>
                    <section>
                      <input
                        type="radio"
                        id="Completed"
                        name="status"
                        value="Completed"
                        onChange={handleStatusChange}
                      />
                      <label htmlFor="Completed"> Completed</label>
                    </section>
                  </fieldset>
                  <br />
                </section>
              )}

            {role === "freelancer" &&
              status === MilestoneStatus.Completed &&
              data.milestone.reportURL && (
                <section>
                  <h4 className="font-semibold text-sm mb-1">
                    My progress report/review
                  </h4>

                  <nav className="mt-2 text-sm">
                    {data.milestone.reportURL ? (
                      <a
                        href={data.milestone.reportURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Download the milestone progress report
                      </a>
                    ) : (
                      <output className="text-gray-500 italic">
                        No report was uploaded for this milestone
                      </output>
                    )}
                  </nav>
                  <p className="italic">
                    Waiting for the client to approve this milestone.
                  </p>
                </section>
              )}

            {role === "freelancer" &&
              status === MilestoneStatus.Approved &&
              data.milestone.reportURL && (
                <section>
                  <h4 className="font-semibold text-sm mb-1">
                    My progress report/review
                  </h4>

                  <nav className="mt-2 text-sm">
                    {data.milestone.reportURL ? (
                      <a
                        href={data.milestone.reportURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        Download the milestone progress report
                      </a>
                    ) : (
                      <output className="text-gray-500 italic">
                        No report was uploaded for this milestone
                      </output>
                    )}
                  </nav>
                  <p className="italic">The client has approved your report.</p>
                </section>
              )}

            {role === "freelancer" &&
              status === MilestoneStatus.Completed &&
              !data.milestone.reportURL && (
                <>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload files to show the client your work.
                  </label>
                  <section className="flex items-center">
                    {!reportURL ? (
                      <UploadComponent
                        uploadFunction={uploadFile}
                        path="MilestoneReport"
                        name={data.milestone.id}
                        onUploadComplete={handleUploadComplete}
                      />
                    ) : (
                      <section className="flex items-center justify-between p-3 bg-neutral-700 rounded-lg border border-neutral-600">
                        <section
                          className="flex items-center gap-3 cursor-pointer hover:bg-neutral-600 p-2 rounded transition-colors"
                          onClick={togglePdfPreview}
                        >
                          <FileText className="text-blue-400" />
                          <section className="text-sm text-gray-200 inline">
                            {fileName}
                          </section>
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
                  <Button
                    caption="Upload Report"
                    onClick={handleReportSubmit}
                  />
                </>
              )}

            {role === "client" && status === MilestoneStatus.Completed && (
              <section>
                <h4 className="font-semibold text-sm mb-1">
                  Freelancer progress report/review
                </h4>

                <nav className="mt-2 text-sm ">
                  {data.milestone.reportURL ? (
                    <a
                      href={data.milestone.reportURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      Download the freelancers progress report
                    </a>
                  ) : (
                    <output className="text-gray-500 italic">
                      No report was uploaded for this milestone
                    </output>
                  )}
                </nav>
                <h4 className="font-semibold text-sm mb-1 mt-3">
                  Send the freelancer feedback with this link:
                </h4>
                {/*Pls put link to chat system here*/}
                <section>
                      {/* Link to chat with freelancer */}
                      {jobWithUser && jobWithUser.userData ? (
                        <>
                          <ChatLink
                            job={jobWithUser.job}
                            userData={jobWithUser.userData}
                            currentUserId={user!.authUser.uid}
                          >
                            Visit Chat
                          </ChatLink>
                        </>
                      ) : (
                        <p>Loading chat link...</p>
                      )}
                    </section>
                <article className="mt-4">
                  <Button
                    caption={isApproving ? "Approving..." : "Approve"}
                    onClick={async () => {
                      setIsApproving(true);
                      try {
                        await updateMilestoneStatus(
                          data.jobId,
                          data.milestone.id,
                          3
                        );
                        refetch();
                        toast.success("Milestone approved successfully");
                        onClose();
                      } catch (error) {
                        console.error("Error approving milestone:", error);
                        toast.error("Failed to approve milestone");
                      } finally {
                        setIsApproving(false);
                      }
                    }}
                  />
                </article>
              </section>
            )}
            {((role === "client" && status === MilestoneStatus.OnHalt) ||
              (role === "client" && status === MilestoneStatus.InProgress)) && (
              <section>
                <h4 className="font-semibold text-sm mb-1">
                  Freelancer progress report/review
                </h4>
                <p className="text-sm text-gray-300">
                  This milestone is currently {MilestoneStatusToString(status)}{" "}
                  so there is no progress report to review yet
                </p>
              </section>
            )}
            {role === "client" && status === MilestoneStatus.Approved && (
              <section>
                <h4 className="font-semibold text-sm mb-1">
                  Freelancer progress report/review
                </h4>
                <p className="text-sm text-gray-300">
                  You have already approved this milestone but can still view
                  the progress report here:{" "}
                </p>
                <nav className="mt-2 text-sm">
                  {data.milestone.reportURL ? (
                    <a
                      href={data.milestone.reportURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      Download the freelancers progress report
                    </a>
                  ) : (
                    <output className="text-gray-500 italic">
                      No report was uploaded for this milestone
                    </output>
                  )}
                </nav>
              </section>
            )}

            {role == "client" &&
              status == MilestoneStatus.Approved &&
              (paymentStatus == PaymentStatus.Unpaid ||
                paymentStatus == undefined) && (
                <PayPalWrapper
                  amount={data.milestone.payment.toString()}
                  milestoneId={data.milestone.id}
                  onSuccess={handleSuccessfulPayment}
                ></PayPalWrapper>
              )}

            {role == "freelancer" &&
              status == MilestoneStatus.Approved &&
              paymentStatus == PaymentStatus.Escrow && (
                <section className="flex flex-col gap-4 basis-full">
                  <RequestPayout
                    jobId={data.jobId}
                    milestoneId={data.milestone.id}
                    amount={data.milestone.payment.toString()}
                    note={`Milestone (${data.milestone.title} payment - $${data.milestone.payment}`}
                    onSuccess={handleSuccessfulPayout}
                  ></RequestPayout>
                </section>
              )}
          </section>
        </article>
      </section>
    </Modal>
  );
};

export default ViewMilestones;
