import React from "react";


// This component will display the account status as pending with an hour glass icon
const PendingCard = () => {
  return (
    // this component is made up of an outher grey layer, an inner orange layer and a white hourglass icon 
    <section
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 max-w-md "
              >
                <div
                  className="p-3 mr-4 text-orange-500 bg-orange-100 rounded-full dark:text-orange-100 dark:bg-orange-500"
                >
                  <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M6 2a1 1 0 000 2h1v1.586A2 2 0 007.586 7L10 9.414V10.5a1 1 0 01-.293.707L7.586 13a2 2 0 00-.586 1.414V16H6a1 1 0 100 2h12a1 1 0 100-2h-1v-1.586a2 2 0 00-.586-1.414l-2.121-2.121A1 1 0 0114 10.5v-.586L16.414 7A2 2 0 0017 5.586V4h1a1 1 0 100-2H6z"
                    ></path> 
                  </svg>
                </div>
                <div>
                  <p
                    className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                   Your account status is: 
                  </p>
                  <p
                    className="text-lg font-semibold text-gray-700 dark:text-gray-200"
                  >
                    Pending 
                  </p>
                </div>
    </section>
  );
};

// Export the pending card for use in other parts of the program
export default PendingCard;