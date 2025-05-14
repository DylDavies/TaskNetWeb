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
    const userSnap = await getDoc(userRef);
    const currentRatings = userSnap.data()?.ratings || [];
    const updatedRatings = [...currentRatings, newRating];
    
    await updateDoc(userRef, {
      ratings: updatedRatings
    });
    
  } catch (error) {
    console.error("Failed to add rating:", error);
  }
};
//This function sets the hasFreelancerRated field to be true, indicating that the freelancer has rated the client
async function setFreelancerHasRated(jobID: string){
  try{
    const userRef = doc(db, "Jobs", jobID)
    await updateDoc(userRef, {
      hasFreelancerRated: true
    });
  }catch (error) {
    console.error("Could not set freelancer rating to be true", error);
  };
}

//This function sets the hasClientRated field to be true, indicating that the client has rated the freelancer
async function setClientHasRated(jobID: string){
  try{
    const userRef = doc(db, "Jobs", jobID)
    await updateDoc(userRef, {
      hasClientRated: true
    });
  }catch (error) {
    console.error("Could not set client rating to be true", error);
  };
}

  export {SetRatingAverage, SetRatingCount, AddRating, setFreelancerHasRated,setClientHasRated}