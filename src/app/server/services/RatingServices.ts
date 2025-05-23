
//  This function will take in a new average for the users performance rating and update its value in the database
async function SetRatingAverage(uid: string, newAverage: number | null){
  const response = await fetch(`/api/rating/average?userID=${uid}&Avg=${newAverage}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
};

//This function will take in a new total number of ratings for a users rating and update its value in the database
async function SetRatingCount(uid: string, newRatingCount: number | null){
     const response = await fetch(`/api/rating/count?userID=${uid}&count=${newRatingCount}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
  };

//This function will add to the array that stores all the ratings for a person
async function AddRating(uid: string, newRating: number) {
   const response = await fetch(`/api/rating/add?userID=${uid}&rating=${newRating}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
  };

//This function sets the hasFreelancerRated field to be true, indicating that the freelancer has rated the client
async function setFreelancerHasRated(jobID: string){
  const response = await fetch(`/api/rating/freelancer?JobID=${jobID}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
}

//This function sets the hasClientRated field to be true, indicating that the client has rated the freelancer
async function setClientHasRated(jobID: string){
 const response = await fetch(`/api/rating/client?JobID=${jobID}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' }
    }); 

    if (response.status == 500) console.error(await response.json());
}

  export {SetRatingAverage, SetRatingCount, AddRating, setFreelancerHasRated,setClientHasRated}