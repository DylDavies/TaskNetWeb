'use client';

import React from "react";
import "../button/Button.css";
import "../inputbar/inputBar.css";
import Button from "../button/Button";

interface JobData {
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

const ViewJobModal = ({ job, onClose }: { job: JobData; onClose: () => void }) => {
  return (
    <section className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
        <section className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Job Details</h2>
          <button
            onClick={onClose}
            className="text-white text-xl hover:text-red-400"
          >
            ×
          </button>
        </section>

        <section className="flex flex-col gap-4">
          {/* Title */}
          <h3 className="text-2xl font-semibold">{job.title}</h3>

          {/* Company info */}
          <section className="flex items-center gap-3">
            <img
              src={job.companyImage}
              alt={`${job.company} logo`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="text-lg font-medium">{job.company}</span>
          </section>

          {/* Description */}
          <section>
            <h4 className="font-semibold text-sm mb-1">Description</h4>
            <p className="text-sm text-gray-300">{job.description}</p>
          </section>

          {/* Budget */}
          <section>
            <h4 className="font-semibold text-sm mb-1">Budget</h4>
            <p className="text-sm text-gray-300">
              ${job.minBudget} - ${job.maxBudget}
            </p>
          </section>

          {/* Deadline */}
          <section>
            <h4 className="font-semibold text-sm mb-1">Deadline</h4>
            <p className="text-sm text-gray-300">{job.deadline}</p>
          </section>

          {/* Status */}
          <section>
            <h4 className="font-semibold text-sm mb-1">Status</h4>
            <p className="text-sm text-gray-300 capitalize">{job.status}</p>
          </section>

          {/* Skills Pills */}
          <section>
            <h4 className="font-semibold text-sm mb-1">Skills</h4>
            <section className="flex flex-wrap gap-2 mt-2">
              {job.skills.map((skill) => (
                <section
                  key={skill}
                  className="bg-blue-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                </section>
              ))}
            </section>
          </section>
          <Button caption={"Apply"} />
        </section>
      </article>
    </section>
  );
};

export default ViewJobModal;
