import React from "react";

type Props = {
  username: string; // username displayed on the card
  type: string; // freelancer or client to determine the message
};

// WelcomeCard component will take in username and type as props and then display an appropriate welcome message
const WelcomeCard: React.FC<Props> = ({ username, type}) => {
    let message = "";

    //set message type 
    if (type === "freelancer"){ 
        message = "Let’s help you land projects, build your portfolio, and connect with clients who value your talent.";
    }else if (type === "client"){
       message = "Browse skilled freelancers, post your projects, and hire with confidence — all in one place";
    }
  return (
    // will have a username, message and icon with the users initial
    <section className="max-w-1/2 w-full bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center space-x-4">
    <section className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-semibold">
      {username.charAt(0).toUpperCase()}
    </section>
    <section>
      <h2 className="text-xl font-bold text-white">
        Welcome, {username}
      </h2>
      <p className="text-sm text-gray-400">
        {message}
      </p>
    </section>
  </section>
  
  
  );
};

export default WelcomeCard;