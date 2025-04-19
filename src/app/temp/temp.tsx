import React from 'react';

type Props = {
    JobID: string; // freelancer or client to determine the messag
    EstimatedTimeline: number;
    BidAmount: number;
    ApplicantID: string
    CVURL:string

  };

const GetApplication: React.FC<Props> = ({ JobID, EstimatedTimeline, BidAmount, ApplicantID, CVURL }) => {
  return (
    <section className="p-6 rounded-xl shadow-md bg-gray-900 text-white max-w-xl mx-auto space-y-6">
      <header>
        <h2 className="text-3xl font-bold">Application Details</h2>
      </header>

      <section>
        <h3 className="font-semibold">Job ID</h3>
        <p>{JobID}</p>
      </section>

      <section>
        <h3 className="font-semibold">Estimated Timeline</h3>
        <p>{EstimatedTimeline}</p>
      </section>

      <section>
        <h3 className="font-semibold">Bid Amount</h3>
        <p>R{BidAmount}</p>
      </section>

      <section>
        <h3 className="font-semibold">Applicant ID</h3>
        <p>{ApplicantID}</p>
      </section>

      <section>
        <h3 className="font-semibold">CV</h3>
        <iframe
          src={CVURL}
          title="Applicant CV"
          width="100%"
          height="500px"
          className="rounded border border-gray-700 mt-2"
        ></iframe>
        <nav className="mt-2">
          <a
            href={CVURL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            Download CV
          </a>
        </nav>
      </section>
    </section>
  );
}

export default GetApplication;
