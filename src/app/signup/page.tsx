"use client";
import React, { useState } from "react";
import InputBar from "../components/inputbar/InputBar";
import "../components/inputbar/inputBar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import "./global.css";
import AuthService from "../services/AuthService"; // or wherever your AuthService is
import { sendEmail } from "../server/services/DatabaseService";

export default function Page() {
  const [inputText, setInputText] = useState("");

  const handleSignupClick = async () => {
    try {
      const activeUser = await AuthService.getCurrentUser();

      if (!activeUser) {
        alert("No active user found. Please log in first.");
        return;
      }

      if (activeUser) {
        const userEmail = activeUser.authUser.email;
        const userName = activeUser.authUser.displayName;
        console.log(userEmail);
        console.log(userName);

        if (!userEmail) {
          alert("No email found for the current user.");
          return;
        }

        if (!userName) {
          alert("No username found for the current user.");
          return;
        }

        console.log("Sending email to:", userEmail);

        // Send the signup confirmation email
        const subject = "Welcome to TaskNet! You're on the Waiting List";
        const text = `
        Hello ${userName},
        
        Thank you for creating an account with TaskNet! We're excited to have you join our platform.
        
        At the moment, you're on our waiting list for approval as a pending user. Once your account is reviewed and approved, you'll be granted full access to all the features and opportunities TaskNet has to offer.
        
        If you have any questions or need assistance, don't hesitate to reach out to us at support@tasknet.tech.
        
        We appreciate your patience and look forward to having you fully onboard soon!
      
        Best regards,
        The TaskNet Team
        `;
        await sendEmail(userEmail, subject, text);

        alert("Signup confirmation email sent successfully!");
        setInputText("");
      }
    } catch (error) {
      console.error("Error during signup or sending email:", error);
      alert("Oops! Something went wrong.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };
  return (
    <main className="flex items-center justify-center h-screen bg-neutral-900">
      <section className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
        {/* Left side (Image section) */}
        <section className="w-1/2 bg-neutral-900 text-white flex justify-center items-center">
          <img
            src="/images/signup-freelance.jpg"
            className="w-full h-full object-cover"
            alt="Sign Up"
          />
        </section>

        {/* Right side (Form section) */}
        <section className="w-1/2 bg-neutral-800 flex flex-col justify-center items-center p-10 text-white">
          <article className="w-full text-center mb-6">
            <h1 className="text-4xl font-bold mb-4">SIGN UP</h1>
          </article>

          {/* Form Fields */}
          <article className="w-full flex flex-col gap-4">
            {/* Username */}
            <section className="flex items-center gap-4">
              <section className="w-1/3 text-right text-lg opacity-80">
                Username
              </section>
              <section className="w-2/3">
                <InputBar
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  type="username"
                />
              </section>
            </section>

            {/* Role Selection */}
            <section className="flex items-center gap-4">
              <section className="w-1/3 text-right text-lg opacity-80">
                Select Role
              </section>
              <section className="w-2/3">
                <select className="w-full p-2 rounded text-white">
                  <option value="client">Client</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </section>
            </section>
            <Button caption={"SIGN UP"} onClick={handleSignupClick} />
          </article>
        </section>
      </section>
    </main>
  );
}
