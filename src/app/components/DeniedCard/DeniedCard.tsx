import React from "react";

const DeniedCard = () => {
  return (
    <section className="flex items-center justify-center p-4 bg-gray-800 rounded-lg shadow-xs max-w-md">
      <section className="p-3 mr-4 text-red-100 bg-red-500 rounded-full">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </section>
      <section>
        <p className="mb-2 text-sm font-medium text-gray-400">
          Your account status is:
        </p>
        <p className="text-lg font-semibold text-gray-200">
          Denied
        </p>
      </section>
    </section>
  );
};

export default DeniedCard;