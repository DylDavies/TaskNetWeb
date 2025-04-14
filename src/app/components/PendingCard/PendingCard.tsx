import React from "react";

const PendingCard = () => {
  return (
    // this component is made up of an outher grey layer, an inner orange layer and a white hourglass icon 
    <section className="flex items-center justify-center p-4 bg-gray-800 rounded-lg shadow-xs max-w-md">
  <section className="p-3 mr-4 text-orange-100 bg-orange-500 rounded-full">
    <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 20 20">
      <path
        d="M6 2a1 1 0 000 2h1v1.586A2 2 0 007.586 7L10 9.414V10.5a1 1 0 01-.293.707L7.586 13a2 2 0 00-.586 1.414V16H6a1 1 0 100 2h12a1 1 0 100-2h-1v-1.586a2 2 0 00-.586-1.414l-2.121-2.121A1 1 0 0114 10.5v-.586L16.414 7A2 2 0 0017 5.586V4h1a1 1 0 100-2H6z"
      ></path>
    </svg>
  </section>
  <section>
    <p className="mb-2 text-sm font-medium text-gray-400">
      Your account status is:
    </p>
    <p className="text-lg font-semibold text-gray-200">
      Pending
    </p>
  </section>
</section>

  );
};

// Export the pending card for use in other parts of the program
export default PendingCard;
