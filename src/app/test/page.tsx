'use client';

import React from "react";
import ViewJobModal from "../components/ViewJobModal/ViewJobModal"; // Adjust the path if necessary

const Page = () => {
  const sampleJob = {
    title: "Web Developer",
    company: "Tech Solutions",
    companyImage: "https://via.placeholder.com/150", // Replace with an actual image URL if needed
    description: "We are looking for a skilled Web Developer to join our team and work on exciting projects.",
    minBudget: "3000",
    maxBudget: "5000",
    deadline: "2025-05-15",
    status: "Open",
    skills: ["JavaScript", "React", "Node.js", "CSS", "HTML"], // Added skills
  };

  const handleCloseModal = () => {
    // Handle closing if necessary, but not needed since the modal is always open
  };

  return (
    <section>
      <ViewJobModal job={sampleJob} onClose={handleCloseModal} />
    </section>
  );
};

export default Page;
