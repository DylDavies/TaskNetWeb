'use client';

import React from "react";
import CreateJobModal from "../components/CreateJobModal/CreateJobModal";

const HomePage = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <article>
        <CreateJobModal />
      </article>
    </section>
  );
};

export default HomePage;
