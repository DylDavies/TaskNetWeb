"use client";

import ViewMilestones from "../components/viewMilestoneFreelancer/viewMilestoneFreelancer";

export default function TestPage() {
  const fakeData = {
    jobId: "job001",
    milestone: {
      title: "Initial Consultation",
      description: "Talk with client and draft first ideas",
      status: "In Progress",
      deadline: Date.now() + 86400000, // tomorrow
      payment: 200,
    },
  };

  return (
    <ViewMilestones
      data={fakeData}
      onClose={() => console.log("Modal closed")}
    />
  );
}
