import React from "react";
import JobCard from "../components/JobOverview/JobOverview";

const App = () => {
  const jobData = {
    company: "Invision",
    jobTitle: "Sr. Frontend Engineer",
    budget: "180k - 250k",
    deadline: "30 April 2025",
    skills: ["React", "TypeScript", "Tailwind CSS", "Figma", "Git"],
  };
  const jobData2 = {
    company: "Windmill",
    jobTitle: "UI/UX Designer",
    budget: "100k - 130k",
    deadline: "15 May 2025",
    skills: ["Figma", "Sketch", "Prototyping", "Accessibility", "User Research"],
  };

  return (
    <main className="bg-gray-100 min-h-screen py-10 bg-[#cdd5f6] bg-color  ">
      <h1 className="text-2xl font-bold text-center mb-6">Available Jobs</h1>
      <section className="flex justify-center gap-6 flex-wrap">
        <JobCard {...jobData} />
        <JobCard {...jobData2} />
      </section>
      
    </main>
  );
};

export default App;