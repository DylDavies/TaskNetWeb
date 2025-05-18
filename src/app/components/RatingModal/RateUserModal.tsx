"use client";
import React, { useState} from "react";
import Modal from "react-modal";
import { AiFillStar } from "react-icons/ai";
import Button from "../button/Button";
import "../button/Button.css";
import { newRatingCalculation } from "@/app/server/formatters/RatingCalculations";
import { SetRatingAverage, SetRatingCount, AddRating } from "@/app/server/services/RatingServices";
import UserData from "@/app/interfaces/UserData.interface";
import toast from "react-hot-toast";
import UserType from "@/app/enums/UserType.enum";
import { setFreelancerHasRated, setClientHasRated } from "@/app/server/services/RatingServices";
import { useContext } from "react";
import { JobContext, JobContextType } from "@/app/JobContext";
import { AuthContext, AuthContextType } from "@/app/AuthContext";

/*This modal pops up when a job is completed for both freelancer and client to be able to rate eachother, they can select stars out of 5 and submit the rating*/

interface RateUserModalProps {
  data: UserData;
  uid: string;
  ratedName: string;
  isOpen: boolean;

}

const RateUserModal = ({ data, uid,ratedName,isOpen }: RateUserModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const[ModalisOpen, setModalisOpen] = useState(isOpen)
  const { user } = useContext(AuthContext) as AuthContextType;
  const { jobID } = useContext(JobContext) as JobContextType;

  //Close the modal
  const CloseModal = () =>{
    setModalisOpen(false);
  }
  
  if (typeof window !== "undefined") {
      Modal.setAppElement(document.body); 
    }

  
    //When the client or freelancer submits the rating, the person who they rated ratings will be updated
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 )  return; // Don't submit if no rating is selected
  
    try {
      if(jobID){
        await AddRating(uid, rating);
     
      const newAverage = newRatingCalculation(data, rating); //Calculate the new average rating given the new rating
      await SetRatingAverage(uid, newAverage);
      
      const newCount = (data.ratingCount || 0) + 1; //Update the total number of ratings 
      await SetRatingCount(uid, newCount);

      if (user?.userData.type === UserType.Freelancer) { //Set if the client or freelancer has already rated for that job so that they won't be prompted to rate more than once
        await setFreelancerHasRated(jobID);
      } else {
        await setClientHasRated(jobID);
      }
      
      toast.success(`You rated ${ratedName} ${rating} star${rating > 1 ? 's' : ''}!`);
      CloseModal();
      }
      
      
    } catch (error) {
      console.error("Failed to submit rating:", error);

  };
  
}



  return (
    <section id ="root">
    <Modal
      isOpen={ModalisOpen}
      onRequestClose={CloseModal}
      className="rounded-2xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
      overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
        <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto">
          <section className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Rate , {ratedName} , during this job</h2>
              <button
              onClick={CloseModal}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
              aria-label="Close"
            >
              &times;
            </button>
          </section>

          <form onSubmit= {handleSubmit} className="flex flex-col gap-4">
            <section className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-colors"
                >
                  <AiFillStar
                      className={`text-4xl ${
                        star <= (hoverRating || rating) 
                          ? "text-yellow-400" 
                          : "text-gray-500"
                      }`}
                    />
                </button>
              ))}
            </section>

            <section className="flex justify-end">
              <Button caption="Submit" type="submit" />
            </section>
          </form>
        </article>
      </section>
    </Modal>
  </section>
    
  );
};

export default RateUserModal;
