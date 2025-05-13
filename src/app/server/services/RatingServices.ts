'use server'
import { doc, updateDoc,getDoc } from "firebase/firestore"; 
import { db } from "../../firebase";

//  This function will take in a new average for the users performance rating and update its value in the database
async function SetRatingAverage(uid: string, newAverage: number | null){
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ratingAverage: newAverage
    });
  } catch (error) {
    console.error("Could not set new rating", error);
  };
};

//This function will take in a new total number of ratings for a users rating and update its value in the database
async function SetRatingCount(uid: string, newRatingCount: number | null){
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ratingCount: newRatingCount
      });
    } catch (error) {
      console.error("Could not set a new total number of ratings", error);
    };
  };

//This function will add to the array that stores all the ratings for a person
async function AddRating(uid: string, newRating: number) {
  try {
    const userRef = doc(db, "users", uid);
    
    // 1. First get the current array
    const userSnap = await getDoc(userRef);
    const currentRatings = userSnap.data()?.ratings || [];
    
    // 2. Manually append the new rating
    const updatedRatings = [...currentRatings, newRating];
    
    // 3. Write the entire array back
    await updateDoc(userRef, {
      ratings: updatedRatings
    });
    
  } catch (error) {
    console.error("Failed to add rating:", error);
  }
};

  export {SetRatingAverage, SetRatingCount, AddRating}