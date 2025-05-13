"use client";
import React, { useState, useEffect} from "react";

import Modal from "react-modal";
import { AiFillStar } from "react-icons/ai";
import Button from "../button/Button";
import "../button/Button.css";

interface RateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

const RateUserModal = ({ isOpen, onClose, onSubmit }: RateUserModalProps) => {
  const [rating, setRating] = useState(0);

  useEffect(() => {
  if (typeof window !== "undefined") {
    Modal.setAppElement("body");
  }
  }, []);


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="rounded-2xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto z-50"
      overlayClassName="fixed inset-0 bg-purple bg-opacity-0 backdrop-blur-sm z-40 flex items-center justify-center"
    >
      <section className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50">
        <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto">
          <section className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Rate This User</h2>
            <button
              onClick={onClose}
              className="text-white text-xl hover:text-red-400"
            >
              ×
            </button>
          </section>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(rating);
              onClose();
            }}
            className="flex flex-col gap-4"
          >
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
  );
};

export default RateUserModal;
