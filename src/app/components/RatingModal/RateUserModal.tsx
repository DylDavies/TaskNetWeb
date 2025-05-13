"use client";
import React, { useState, useEffect} from "react";

import Modal from "react-modal";
import { AiFillStar } from "react-icons/ai";
import Button from "../button/Button";
import "../button/Button.css";
import { newRatingCalculation } from "@/app/server/formatters/RatingCalculations";
import { SetRatingAverage, SetRatingCount, AddRating } from "@/app/server/services/RatingServices";
import UserData from "@/app/interfaces/UserData.interface";
import { useContext } from "react";
import { AuthContext } from "@/app/AuthContext";
import { AuthContextType } from "@/app/AuthContext";

interface RateUserModalProps {
  
  data: UserData;
  uid: string;
}

const RateUserModal = ({ data, uid }: RateUserModalProps) => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const [rating, setRating] = useState(0);
  const [modalIsOpen, setIsOpen] = useState(false);
  const usersType = user?.userData.type;


  useEffect(() => {
  if (typeof window !== "undefined") {
    Modal.setAppElement("body");
  }
  }, []);

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return; // Don't submit if no rating selected
    
  
    try {
      // 1. Add the new rating to the ratings array
      await AddRating(uid, rating);
      
      // 2. Calculate the new average rating
      const newAverage = newRatingCalculation(data, rating);
      
      // 3. Update the average rating in the database
      await SetRatingAverage(uid, newAverage);
      
      // 4. Update the rating count (increment by 1)
      const newCount = (data.ratingCount || 0) + 1;
      await SetRatingCount(uid, newCount);
      
      closeModal();
    } catch (error) {
      console.error("Failed to submit rating:", error);

  };
}



  return (
    <section id ="root">
      <Button caption={"Rate person"} onClick={openModal}/>
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className="rounded-2xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
      overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
        <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto">
          <section className="flex justify-between items-center mb-4">
            {usersType === 2 &&(
              <h2 className="text-xl font-bold">Rate {} performance</h2>
            )}
            
            <button
              onClick={closeModal}
              className="text-white text-xl hover:text-red-400"
            >
              ×
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
                  className="text-3xl transition-colors"
                >
                  <AiFillStar
                    className={
                      star <= rating ? "text-yellow-400" : "text-gray-500"
                    }
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
